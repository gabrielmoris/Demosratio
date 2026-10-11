import { describe, it, expect } from 'vitest';
import { getResponseText } from '@/lib/services/ai/geminiConfig';

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
