import { describe, it, expect } from 'vitest';
import { getModelName, getResponseText, noThinkingConfig } from '@/lib/services/ai/geminiConfig';

const endpoint = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

describe('getModelName', () => {
  it('reads the model from the endpoint', () => {
    expect(getModelName(endpoint('gemini-2.5-flash'))).toBe('gemini-2.5-flash');
  });

  it('returns an empty string when the URL has no model', () => {
    expect(getModelName('https://gemini.test/model:generateContent')).toBe('');
  });
});

describe('noThinkingConfig', () => {
  it('turns thinking off with a budget of 0 on Gemini 2.5 Flash and Flash-Lite', () => {
    expect(noThinkingConfig(endpoint('gemini-2.5-flash'))).toEqual({ thinkingBudget: 0 });
    expect(noThinkingConfig(endpoint('gemini-2.5-flash-lite'))).toEqual({ thinkingBudget: 0 });
  });

  it('uses the minimal level on Gemini 3', () => {
    expect(noThinkingConfig(endpoint('gemini-3.5-flash-lite'))).toEqual({ thinkingLevel: 'minimal' });
    expect(noThinkingConfig(endpoint('gemini-3.6-flash'))).toEqual({ thinkingLevel: 'minimal' });
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
