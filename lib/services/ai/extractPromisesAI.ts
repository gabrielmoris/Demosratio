import { ExtractedSubjectPromises, Subject } from '@/types/politicalParties';
import { Logger } from 'tslog';
import { MINIMAL_THINKING, getResponseText } from './geminiConfig';
import { geminiFetch } from './geminiRequest';

// The extraction route has maxDuration 300s; stop a bit before that
const EXTRACTION_DEADLINE_MS = 280_000;

const log = new Logger();

export const MAX_PROMISES_PER_SUBJECT = 5;

const URL_RETRIEVAL_SUCCESS = 'URL_RETRIEVAL_STATUS_SUCCESS';

export class PdfNotReadError extends Error {
  constructor(public statuses: string[]) {
    super(`Gemini could not read the campaign PDF (${statuses.join(', ') || 'link not fetched'})`);
    this.name = 'PdfNotReadError';
  }
}

type RawExtraction = { subject_id?: unknown; promises?: unknown }[];

type UrlMetadata = { urlRetrievalStatus?: string; url_retrieval_status?: string };
type UrlContextCandidate = {
  urlContextMetadata?: { urlMetadata?: UrlMetadata[] };
  url_context_metadata?: { url_metadata?: UrlMetadata[] };
};

/** Retrieval status of each link Gemini fetched with the url_context tool (accepts camelCase or snake_case). */
export function getUrlRetrievalStatuses(data: { candidates?: UrlContextCandidate[] }): string[] {
  const candidate = data.candidates?.[0];
  const entries =
    candidate?.urlContextMetadata?.urlMetadata ??
    candidate?.url_context_metadata?.url_metadata ??
    [];
  return entries.map(e => e.urlRetrievalStatus ?? e.url_retrieval_status ?? 'UNKNOWN');
}

/**
 * Only known subjects, unique promises,
 * at most MAX_PROMISES_PER_SUBJECT each.
 */
export function normalizeExtraction(
  raw: unknown,
  subjects: Pick<Subject, 'id' | 'name'>[]
): ExtractedSubjectPromises[] {
  const bySubject = new Map<number, string[]>();

  if (Array.isArray(raw)) {
    for (const entry of raw as RawExtraction) {
      const subjectId = Number(entry?.subject_id);
      if (!subjects.some(s => s.id === subjectId) || !Array.isArray(entry?.promises)) continue;

      const current = bySubject.get(subjectId) ?? [];
      for (const promise of entry.promises) {
        if (typeof promise !== 'string') continue;
        const text = promise.trim();
        if (text && !current.some(p => p.toLowerCase() === text.toLowerCase())) current.push(text);
      }
      bySubject.set(subjectId, current);
    }
  }

  return subjects.map(s => ({
    subject_id: s.id,
    subject_name: s.name,
    promises: (bySubject.get(s.id) ?? []).slice(0, MAX_PROMISES_PER_SUBJECT),
  }));
}

export async function extractPromisesFromPdf(
  pdfUrl: string,
  subjects: Subject[]
): Promise<ExtractedSubjectPromises[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not defined in environment variables');
  const apiUrl = process.env.GEMINI_MODEL_ENDPOINT;
  if (!apiUrl) throw new Error('GEMINI_MODEL_ENDPOINT is not defined in environment variables');

  const subjectList = subjects
    .map(s => `- subject_id ${s.id}: ${s.name} — ${s.description}`)
    .join('\n');

  const prompt = `
    Eres un analista político neutral. Este enlace es el PDF del programa electoral de un partido político español:
    ${pdfUrl}

    TAREA:
    Lee el PDF del enlace. Para CADA uno de estos temas, extrae como MÁXIMO ${MAX_PROMISES_PER_SUBJECT} promesas, las más importantes del programa:
    ${subjectList}

    REGLAS ESTRICTAS:
    - Solo promesas que aparecen explícitamente en el PDF. No inventes ni deduzcas.
    - Prioriza promesas concretas y verificables (medidas, leyes, cifras, plazos) sobre declaraciones genéricas.
    - Una frase clara por promesa, en español, fiel al texto del programa y sin valoraciones.
    - Cada promesa va en el tema que mejor encaje y en un solo tema. No repitas promesas.
    - Usa solo los subject_id de la lista. Si un tema no tiene promesas relevantes, devuelve una lista vacía.
  `;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{ url_context: {} }],
    generationConfig: {
      maxOutputTokens: 32000,
      thinkingConfig: MINIMAL_THINKING,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            subject_id: { type: 'INTEGER' },
            promises: { type: 'ARRAY', items: { type: 'STRING' } },
          },
          required: ['subject_id', 'promises'],
        },
      },
    },
  };

  const response = await geminiFetch(
    `${apiUrl}?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    },
    { deadlineMs: EXTRACTION_DEADLINE_MS }
  );

  if (!response.ok) {
    const errorText = await response.text();
    log.error(`Gemini API error: ${response.status} ${response.statusText}`, errorText);
    if (response.status === 429) throw new Error('Rate limit hit. Please wait and try again.');
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  const statuses = getUrlRetrievalStatuses(data);
  if (!statuses.includes(URL_RETRIEVAL_SUCCESS)) {
    log.error('Gemini could not read the campaign PDF:', pdfUrl, statuses);
    throw new PdfNotReadError(statuses);
  }

  const generatedText = getResponseText(data);
  if (!generatedText) {
    log.error('Gemini response does not contain expected text content:', data);
    throw new Error('Gemini returned an empty response');
  }

  // Raw answer, before normalizeExtraction drops unknown subjects and trims to 5 per subject.
  log.info('Gemini raw extraction:', generatedText, 'usage:', data.usageMetadata);

  let parsed: unknown;
  try {
    parsed = JSON.parse(generatedText);
  } catch (parseError) {
    log.error('Failed to parse Gemini response as JSON:', parseError, generatedText);
    throw new Error('Failed to parse Gemini response as JSON');
  }

  return normalizeExtraction(parsed, subjects);
}
