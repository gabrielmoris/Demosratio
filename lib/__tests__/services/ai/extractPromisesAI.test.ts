import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  extractPromisesFromPdf,
  getUrlRetrievalStatuses,
  normalizeExtraction,
  PdfNotReadError,
} from '@/lib/services/ai/extractPromisesAI';
import { Subject } from '@/types/politicalParties';

vi.mock('tslog', () => ({
  Logger: class {
    error = vi.fn();
    info = vi.fn();
  },
}));

const subjects = [
  { id: 1, name: 'Educación', description: 'Educación', created_at: new Date() },
  { id: 5, name: 'Salud', description: 'Salud', created_at: new Date() },
] as Subject[];

const PDF_URL = 'https://example.com/programa.pdf';

const geminiResponse = (answer: unknown, status?: string) =>
  new Response(
    JSON.stringify({
      candidates: [
        {
          content: { parts: [{ text: JSON.stringify(answer) }] },
          ...(status && {
            urlContextMetadata: {
              urlMetadata: [{ retrievedUrl: PDF_URL, urlRetrievalStatus: status }],
            },
          }),
        },
      ],
    })
  );

describe('normalizeExtraction', () => {
  it('merges repeated entries for the same subject', () => {
    const raw = [
      { subject_id: 5, promises: ['X'] },
      { subject_id: '5', promises: ['Y', 'x'] },
    ];
    expect(normalizeExtraction(raw, subjects)[1].promises).toEqual(['X', 'Y']);
  });

  it('returns empty lists for non-array output', () => {
    expect(normalizeExtraction({ nope: true }, subjects).every(s => s.promises.length === 0)).toBe(
      true
    );
  });
});

describe('getUrlRetrievalStatuses', () => {
  it('reads camelCase and snake_case metadata', () => {
    const status = 'URL_RETRIEVAL_STATUS_SUCCESS';
    expect(
      getUrlRetrievalStatuses({
        candidates: [{ urlContextMetadata: { urlMetadata: [{ urlRetrievalStatus: status }] } }],
      })
    ).toEqual([status]);
    expect(
      getUrlRetrievalStatuses({
        candidates: [
          { url_context_metadata: { url_metadata: [{ url_retrieval_status: status }] } },
        ],
      })
    ).toEqual([status]);
  });

  it('returns an empty list when Gemini did not fetch anything', () => {
    expect(getUrlRetrievalStatuses({ candidates: [{}] })).toEqual([]);
  });
});

describe('extractPromisesFromPdf', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key';
    process.env.GEMINI_MODEL_ENDPOINT = 'https://gemini.test/model:generateContent';
  });
  afterEach(() => vi.restoreAllMocks());

  it('sends the link with the url_context tool and normalizes the JSON answer', async () => {
    const answer = [{ subject_id: 1, promises: ['Bajar ratios a 20 alumnos por aula'] }];
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(geminiResponse(answer, 'URL_RETRIEVAL_STATUS_SUCCESS'));

    const result = await extractPromisesFromPdf(PDF_URL, subjects);

    const body = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
    expect(body.tools).toEqual([{ url_context: {} }]);
    expect(body.contents[0].parts).toHaveLength(1);
    expect(body.contents[0].parts[0].text).toContain(PDF_URL);
    expect(body.generationConfig.thinkingConfig).toEqual({ thinkingLevel: 'minimal' });
    expect(body.generationConfig.responseMimeType).toBe('application/json');
    expect(result[0].promises).toEqual(['Bajar ratios a 20 alumnos por aula']);
    expect(result[1].promises).toEqual([]);
  });

  it('rejects the answer when Gemini could not read the PDF', async () => {
    const answer = [{ subject_id: 1, promises: ['Invented'] }];
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      geminiResponse(answer, 'URL_RETRIEVAL_STATUS_ERROR')
    );
    await expect(extractPromisesFromPdf(PDF_URL, subjects)).rejects.toBeInstanceOf(PdfNotReadError);
  });

  it('rejects the answer when Gemini did not fetch the link at all', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(geminiResponse([]));
    await expect(extractPromisesFromPdf(PDF_URL, subjects)).rejects.toBeInstanceOf(PdfNotReadError);
  });

  it('throws on Gemini errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('boom', { status: 500 }));
    await expect(extractPromisesFromPdf(PDF_URL, subjects)).rejects.toThrow('Gemini API error');
  });
});
