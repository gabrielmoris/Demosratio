export function getModelName(endpoint: string): string {
  return endpoint.split('/models/')[1]?.split(':')[0] ?? '';
}

export type ThinkingConfig = { thinkingBudget: number } | { thinkingLevel: 'minimal' };

/**
 * The least thinking the model allows. The two families use different fields, and sending the
 * wrong one is a 400 error:
 * - Gemini 2.5 Flash / Flash-Lite: thinkingBudget 0 turns thinking off.
 * - Gemini 3: thinking can't be turned off; "minimal" is the lowest level
 *   (gemini-3.6-flash and 3.5-flash-lite accept it, gemini-3.8-flash starts at "low").
 */
export function noThinkingConfig(endpoint: string): ThinkingConfig {
  return getModelName(endpoint).startsWith('gemini-2.5-flash')
    ? { thinkingBudget: 0 }
    : { thinkingLevel: 'minimal' };
}

type GeminiPart = { text?: string; thought?: boolean };

export function getResponseText(data: {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
}): string {
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter(p => !p.thought && typeof p.text === 'string')
    .map(p => p.text)
    .join('')
    .trim();
}
