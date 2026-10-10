/**
 * Fastest valid thinking setting for the model in GEMINI_MODEL_ENDPOINT.
 * - Gemini 2.x: thinking can be turned off completely (thinkingBudget: 0).
 * - Gemini 3.x: thinking can't be turned off; "low" is the lowest level that works on every 3.x Flash
 *   ("minimal" is rejected by some models, e.g. 3.8 Flash).
 */
export function fastThinkingConfig(endpoint = process.env.GEMINI_MODEL_ENDPOINT ?? "") {
  return /gemini-2\./.test(endpoint) ? { thinkingBudget: 0 } : { thinkingLevel: "low" };
}

type GeminiPart = { text?: string; thought?: boolean };

/** Joins every text part of the first candidate, skipping thought summaries. */
export function getResponseText(data: { candidates?: { content?: { parts?: GeminiPart[] } }[] }): string {
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((p) => !p.thought && typeof p.text === "string")
    .map((p) => p.text)
    .join("")
    .trim();
}
