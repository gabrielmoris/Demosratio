// INFO: Gemini 3 can't turn thinking off; "minimal" is the lowest level. Not every model accepts it
// (gemini-3.6-flash does, gemini-3.8-flash starts at "low")
export const MINIMAL_THINKING = { thinkingLevel: 'minimal' } as const;

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
