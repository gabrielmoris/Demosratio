import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  buildSummaryPrompt,
  normalizeSummary,
  summarizeProposalFromPdf,
  SummaryInput,
} from '@/lib/services/ai/proposalSummaryAI';
import { PdfNotReadError } from '@/lib/services/ai/extractPromisesAI';
import { resetGeminiPacing } from '@/lib/services/ai/geminiRequest';

vi.mock('tslog', () => ({
  Logger: class {
    error = vi.fn();
    info = vi.fn();
    warn = vi.fn();
  },
}));

const input: SummaryInput = {
  pdfUrl: 'https://www.congreso.es/public_oficiales/L15/CONG/BOCG/A/BOCG-15-A-107-1.PDF#page=1',
  initiativeId: '121/000106',
  initiativeTitle: 'Proyecto de Ley Orgánica de medidas en materia de violencia vicaria.',
  expedientText: 'Votación de la enmienda a la totalidad de devolución al Proyecto de Ley Orgánica de medidas en materia de violencia vicaria, presentada por el Grupo Parlamentario VOX.',
  voteTitle: 'Debates de totalidad de iniciativas legislativas.',
};

const es = { summary: 'Una ley sobre violencia vicaria.', yes_means: 'Devolver la ley al Gobierno.', no_means: 'Seguir tramitando la ley.' };

const geminiResponse = (answer: unknown, status = 'URL_RETRIEVAL_STATUS_SUCCESS') =>
  new Response(
    JSON.stringify({
      candidates: [
        {
          content: { parts: [{ text: JSON.stringify(answer) }] },
          urlContextMetadata: { urlMetadata: [{ urlRetrievalStatus: status }] },
        },
      ],
    })
  );

describe('normalizeSummary', () => {
  it('keeps a complete summary and trims whitespace', () => {
    expect(normalizeSummary({ found: true, es: { ...es, summary: '  Una ley\n sobre violencia vicaria.  ' } })).toEqual({
      found: true,
      summary: { es },
    });
  });

  it('treats found:false or missing fields as not found', () => {
    expect(normalizeSummary({ found: false })).toEqual({ found: false });
    expect(normalizeSummary({ found: true, es: { summary: 'x', yes_means: '', no_means: 'y' } })).toEqual({ found: false });
    expect(normalizeSummary({ found: true })).toEqual({ found: false });
    expect(normalizeSummary(null)).toEqual({ found: false });
  });
});

describe('buildSummaryPrompt', () => {
  it('points Gemini at the right initiative and forbids invented facts', () => {
    const prompt = buildSummaryPrompt(input);
    expect(prompt).toContain(input.pdfUrl);
    expect(prompt).toContain('121/000106');
    expect(prompt).toContain(input.expedientText);
    expect(prompt).toContain('No inventes');
    expect(prompt).toContain('español ("es")');
  });
});

describe('summarizeProposalFromPdf', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.stubEnv('GEMINI_MODEL_ENDPOINT', 'https://gemini.test/models/m:generateContent');
    vi.useFakeTimers();
    resetGeminiPacing();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
    fetchMock.mockReset();
  });

  it('returns the summary when Gemini read the PDF', async () => {
    fetchMock.mockResolvedValueOnce(geminiResponse({ found: true, es }));
    expect(await summarizeProposalFromPdf(input)).toEqual({ found: true, summary: { es } });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.tools).toEqual([{ url_context: {} }]);
    expect(Object.keys(body.generationConfig.responseSchema.properties)).toEqual(['found', 'es']);
  });

  it('refuses to answer from memory when the PDF could not be read', async () => {
    fetchMock.mockResolvedValueOnce(geminiResponse({ found: true, es }, 'URL_RETRIEVAL_STATUS_ERROR'));
    await expect(summarizeProposalFromPdf(input)).rejects.toBeInstanceOf(PdfNotReadError);
  });

  it('retries when Gemini is overloaded', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('busy', { status: 503 }))
      .mockResolvedValueOnce(geminiResponse({ found: true, es }));

    const pending = summarizeProposalFromPdf(input);
    await vi.runAllTimersAsync();
    expect(await pending).toEqual({ found: true, summary: { es } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('gives up after the last retry', async () => {
    fetchMock.mockImplementation(async () => new Response('busy', { status: 503 }));
    const pending = summarizeProposalFromPdf(input);
    const assertion = expect(pending).rejects.toThrow('Gemini API error: 503');
    await vi.runAllTimersAsync();
    await assertion;
    // first try + 3 retries (geminiFetch)
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('does not retry other errors', async () => {
    fetchMock.mockResolvedValueOnce(new Response('bad', { status: 400 }));
    await expect(summarizeProposalFromPdf(input)).rejects.toThrow('Gemini API error: 400');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
