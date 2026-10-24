import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  geminiFetch,
  parseRetryDelayMs,
  resetGeminiPacing,
  DEFAULT_MIN_INTERVAL_MS,
} from '@/lib/services/ai/geminiRequest';

vi.mock('tslog', () => ({
  Logger: class {
    warn = vi.fn();
  },
}));

// Real 429 body from the free tier (trimmed)
const quota429 = (retryDelay = '47s') =>
  new Response(
    JSON.stringify({
      error: {
        code: 429,
        status: 'RESOURCE_EXHAUSTED',
        details: [{ '@type': 'type.googleapis.com/google.rpc.RetryInfo', retryDelay }],
      },
    }),
    { status: 429, statusText: 'Too Many Requests' }
  );

const ok = () => new Response('{"ok":true}');

describe('parseRetryDelayMs', () => {
  it('reads Gemini retryDelay and adds a second of margin', () => {
    expect(parseRetryDelayMs('{"retryDelay": "47s"}')).toBe(48_000);
    expect(parseRetryDelayMs('{"retryDelay":"47.166s"}')).toBe(48_166);
  });

  it('returns null when there is no delay', () => {
    expect(parseRetryDelayMs('{"error":{}}')).toBeNull();
  });
});

describe('geminiFetch', () => {
  const fetchMock = vi.fn();
  // Elapsed fake time at each fetch call
  let callTimes: number[];
  let start: number;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('GEMINI_MIN_INTERVAL_MS', String(DEFAULT_MIN_INTERVAL_MS));
    resetGeminiPacing();
    start = Date.now();
    callTimes = [];
    fetchMock.mockImplementation(async () => {
      callTimes.push(Date.now() - start);
      return ok();
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    fetchMock.mockReset();
  });

  const run = async <T>(promise: Promise<T>) => {
    await vi.runAllTimersAsync();
    return promise;
  };

  it('spaces calls 12s apart, even when started together', async () => {
    await run(Promise.all([geminiFetch('u', {}), geminiFetch('u', {}), geminiFetch('u', {})]));
    expect(callTimes).toEqual([0, 12_000, 24_000]);
  });

  it('does not wait when the previous call was long enough ago', async () => {
    await run(geminiFetch('u', {}));
    await vi.advanceTimersByTimeAsync(20_000);
    await run(geminiFetch('u', {}));
    expect(callTimes).toEqual([0, 20_000]);
  });

  it('waits as long as Gemini asks after a 429', async () => {
    fetchMock.mockImplementationOnce(async () => {
      callTimes.push(Date.now() - start);
      return quota429('47s');
    });

    const response = await run(geminiFetch('u', {}));
    expect(response.ok).toBe(true);
    expect(callTimes).toEqual([0, 48_000]);
  });

  it('makes other callers wait while the quota recovers', async () => {
    fetchMock.mockImplementationOnce(async () => {
      callTimes.push(Date.now() - start);
      return quota429('30s');
    });

    const first = geminiFetch('u', {});
    await vi.advanceTimersByTimeAsync(1);
    const second = geminiFetch('u', {});
    await run(Promise.all([first, second]));
    // retry at 31s, the other caller 12s after it
    expect(callTimes).toEqual([0, 31_000, 43_000]);
  });

  it('gives up on the daily quota instead of waiting hours', async () => {
    fetchMock.mockImplementation(async () => quota429('3600s'));
    const response = await run(geminiFetch('u', {}));
    expect(response.status).toBe(429);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // The body is still readable by the caller
    expect(await response.text()).toContain('RESOURCE_EXHAUSTED');
  });

  it('retries 503 with growing waits', async () => {
    fetchMock
      .mockImplementationOnce(async () => {
        callTimes.push(Date.now() - start);
        return new Response('busy', { status: 503 });
      })
      .mockImplementationOnce(async () => {
        callTimes.push(Date.now() - start);
        return new Response('busy', { status: 503 });
      });

    const response = await run(geminiFetch('u', {}));
    expect(response.ok).toBe(true);
    // 0, then +5s, then +15s
    expect(callTimes).toEqual([0, 12_000, 27_000]);
  });

  it('does not retry client errors', async () => {
    fetchMock.mockImplementation(async () => new Response('bad', { status: 400 }));
    const response = await run(geminiFetch('u', {}));
    expect(response.status).toBe(400);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('stops retrying when the deadline would pass', async () => {
    fetchMock.mockImplementation(async () => quota429('47s'));
    const response = await run(geminiFetch('u', {}, { deadlineMs: 30_000 }));
    expect(response.status).toBe(429);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('can be turned off with GEMINI_MIN_INTERVAL_MS=0', async () => {
    vi.stubEnv('GEMINI_MIN_INTERVAL_MS', '0');
    await run(Promise.all([geminiFetch('u', {}), geminiFetch('u', {})]));
    expect(callTimes).toEqual([0, 0]);
  });
});
