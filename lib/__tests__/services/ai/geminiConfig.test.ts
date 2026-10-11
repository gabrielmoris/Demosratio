import { describe, it, expect } from 'vitest';
import { fastThinkingConfig, getResponseText } from '@/lib/services/ai/geminiConfig';

const endpoint = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

describe('fastThinkingConfig', () => {
  it('turns thinking off on Gemini 2.x', () => {
    expect(fastThinkingConfig(endpoint('gemini-2.5-flash'))).toEqual({ thinkingBudget: 0 });
  });
});

describe('getResponseText', () => {
  it('joins text parts and skips thoughts', () => {
    const data = {
      candidates: [
        {
          content: { parts: [{ text: 'hmm', thought: true }, { text: '[{"a"' }, { text: ':1}]' }] },
        },
      ],
    };
    expect(getResponseText(data)).toBe('[{"a":1}]');
  });

  it('returns an empty string when there is no content', () => {
    expect(getResponseText({})).toBe('');
  });
});
