export function fastThinkingConfig(endpoint = process.env.GEMINI_MODEL_ENDPOINT ?? '') {
  return /gemini-2\./.test(endpoint) ? { thinkingBudget: 0 } : { thinkingLevel: 'low' };
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
