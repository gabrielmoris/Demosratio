import { Logger } from 'tslog';

const log = new Logger();

/**
 * Minimum time between two Gemini calls. The free tier allows 5 requests per minute per model,
 * so 12s keeps us under it. Override with GEMINI_MIN_INTERVAL_MS (e.g. 0 on a paid plan).
 */
export const DEFAULT_MIN_INTERVAL_MS = 12_000;

/** Waits used for temporary server errors (500/503 "high demand"). */
export const SERVER_ERROR_DELAYS_MS = [5_000, 15_000, 30_000];

/** Used when a 429 doesn't say how long to wait. */
export const DEFAULT_RATE_LIMIT_WAIT_MS = 60_000;

/** A 429 asking for longer than this is the daily quota: waiting won't help, so give up. */
export const MAX_RATE_LIMIT_WAIT_MS = 90_000;

const MAX_RETRIES = 3;

// Start time reserved for the next call. Shared by every Gemini caller in this server instance.
let nextSlotAt = 0;

/** Test helper: forget previous calls. */
export function resetGeminiPacing(): void {
  nextSlotAt = 0;
}

const minInterval = (): number => {
  const raw = process.env.GEMINI_MIN_INTERVAL_MS?.trim();
  const fromEnv = raw ? Number(raw) : NaN;
  return fromEnv >= 0 ? fromEnv : DEFAULT_MIN_INTERVAL_MS;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Reserves the next free slot (synchronously, so parallel callers queue up) and waits for it. */
async function waitForSlot(): Promise<void> {
  const now = Date.now();
  const startAt = Math.max(now, nextSlotAt);
  nextSlotAt = startAt + minInterval();
  if (startAt > now) await sleep(startAt - now);
}

/**
 * How long Gemini asks us to wait, from the RetryInfo in a 429 body ("retryDelay": "47s"),
 * plus a second of margin. null when the body doesn't say.
 */
export function parseRetryDelayMs(body: string): number | null {
  const match = body.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/);
  return match ? Math.ceil(Number(match[1]) * 1000) + 1000 : null;
}

export interface GeminiFetchOptions {
  /** Give up (and abort a hanging request) after this long, retries included. */
  deadlineMs?: number;
}

/**
 * fetch() for Gemini: spaces calls to stay under the per-minute limit, waits as long as Gemini
 * asks after a 429, and retries 500/503. Returns the last response when it can't retry anymore,
 * so callers keep handling !response.ok as before.
 */
export async function geminiFetch(url: string, init: RequestInit, options: GeminiFetchOptions = {}): Promise<Response> {
  const deadline = options.deadlineMs ? Date.now() + options.deadlineMs : Infinity;
  const timeLeft = () => deadline - Date.now();

  for (let attempt = 0; ; attempt++) {
    await waitForSlot();

    const signal = Number.isFinite(deadline) ? AbortSignal.timeout(Math.max(1, timeLeft())) : undefined;
    const response = await fetch(url, signal ? { ...init, signal } : init);
    if (response.ok) return response;

    const isRateLimit = response.status === 429;
    const isServerError = response.status === 500 || response.status === 503;
    if (!isRateLimit && !isServerError) return response;

    // Read the body to find the wait time, then hand back an equivalent response
    const body = await response.text();
    const giveUp = () =>
      new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers });

    const wait = isRateLimit
      ? (parseRetryDelayMs(body) ?? DEFAULT_RATE_LIMIT_WAIT_MS)
      : SERVER_ERROR_DELAYS_MS[Math.min(attempt, SERVER_ERROR_DELAYS_MS.length - 1)];

    if (attempt >= MAX_RETRIES || (isRateLimit && wait > MAX_RATE_LIMIT_WAIT_MS) || wait >= timeLeft()) {
      return giveUp();
    }

    log.warn(`Gemini answered ${response.status}; retrying in ${Math.round(wait / 1000)}s`);
    // Nobody else should call Gemini while we wait for the quota to free up
    nextSlotAt = Math.max(nextSlotAt, Date.now() + wait);
    await sleep(wait);
  }
}
