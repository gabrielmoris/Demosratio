import { Logger } from 'tslog';
import { PlainSummary, PlainSummaryText } from '@/types/proposal.types';
import { MINIMAL_THINKING, getResponseText } from './geminiConfig';
import { PdfNotReadError, getUrlRetrievalStatuses } from './extractPromisesAI';
import { geminiFetch } from './geminiRequest';

const log = new Logger();

const URL_RETRIEVAL_SUCCESS = 'URL_RETRIEVAL_STATUS_SUCCESS';

/**
 * Locales the summary is written in. Keep in sync with routing.locales in src/i18n/routing.ts
 * (only "es" is enabled today). Adding a locale here makes Gemini write that version too.
 */
export const SUMMARY_LOCALES: string[] = ['es'];

const LOCALE_NAMES: Record<string, string> = { es: 'español', en: 'inglés' };

const MAX_FIELD_LENGTH = 600;

export interface SummaryInput {
  /** Official BOCG PDF of the initiative */
  pdfUrl: string;
  /** e.g. "162/000769" */
  initiativeId: string;
  initiativeTitle: string;
  /** What was voted, as Congreso describes it (may include "Punto 2.") */
  expedientText: string;
  /** Kind of vote, e.g. "Debates de totalidad de iniciativas legislativas." */
  voteTitle: string;
}

export type SummaryResult = { found: true; summary: PlainSummary } | { found: false };

const textSchema = {
  type: 'OBJECT',
  properties: {
    summary: { type: 'STRING' },
    yes_means: { type: 'STRING' },
    no_means: { type: 'STRING' },
  },
  required: ['summary', 'yes_means', 'no_means'],
};

const cleanField = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const text = value.replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, MAX_FIELD_LENGTH) : null;
};

/** Keeps only complete summaries in the expected locales; anything missing means "not found". */
export function normalizeSummary(raw: unknown): SummaryResult {
  const data = raw as { found?: unknown } & Record<string, unknown>;
  if (!data || data.found !== true) return { found: false };

  const summary: PlainSummary = {};
  for (const locale of SUMMARY_LOCALES) {
    const entry = data[locale] as Record<string, unknown> | undefined;
    const text: Partial<PlainSummaryText> = {
      summary: cleanField(entry?.summary) ?? undefined,
      yes_means: cleanField(entry?.yes_means) ?? undefined,
      no_means: cleanField(entry?.no_means) ?? undefined,
    };
    if (!text.summary || !text.yes_means || !text.no_means) return { found: false };
    summary[locale] = text as PlainSummaryText;
  }
  return { found: true, summary };
}

export function buildSummaryPrompt(input: SummaryInput): string {
  return `
    Eres un divulgador político neutral. Explicas votaciones del Congreso de los Diputados de España a personas sin conocimientos de política.

    Este enlace es un PDF oficial del Boletín Oficial de las Cortes Generales (BOCG):
    ${input.pdfUrl}

    El PDF puede contener muchas iniciativas. Busca SOLO la iniciativa con número de expediente ${input.initiativeId}:
    "${input.initiativeTitle}"

    Lo que se votó, según el Congreso:
    - Tipo de votación: ${input.voteTitle}
    - Texto de la votación: ${input.expedientText}

    TAREA:
    1. Lee el texto de esa iniciativa en el PDF.
    2. Explica en lenguaje sencillo qué se votó (2 o 3 frases cortas, sin tecnicismos).
    3. Explica qué significa en la práctica votar SÍ y qué significa votar NO (una frase cada uno).
       Fíjate en el tipo de votación: por ejemplo, en una "enmienda a la totalidad de devolución", votar SÍ significa devolver el proyecto al Gobierno (rechazarlo), no apoyarlo.
       Si la votación es de un punto concreto (por ejemplo "Punto 2."), explica solo ese punto si puedes identificarlo en el texto.
    4. Escribe el resultado en: ${SUMMARY_LOCALES.map(l => `${LOCALE_NAMES[l] ?? l} ("${l}")`).join(', ')}.

    REGLAS ESTRICTAS:
    - Usa SOLO información que aparece en el PDF. No inventes cifras, fechas, nombres ni consecuencias.
    - No des opiniones ni valores la iniciativa. No digas si es buena o mala.
    - No menciones qué partidos votaron a favor o en contra.
    - Si no encuentras la iniciativa ${input.initiativeId} en el PDF, o no puedes leer el PDF, devuelve {"found": false}.
  `;
}

/**
 * Total time for one summary, waits and retries included. Gemini can take ~100s to read a PDF
 * under load, or hang for minutes; past this we give up and the vote is retried on the next run.
 */
export const GEMINI_DEADLINE_MS = 150_000;

/**
 * Writes a plain-language summary of a vote from the official text of its initiative.
 * Throws PdfNotReadError when Gemini can't open the PDF, so we never summarise from memory.
 */
export async function summarizeProposalFromPdf(input: SummaryInput): Promise<SummaryResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not defined in environment variables');
  const apiUrl = process.env.GEMINI_MODEL_ENDPOINT;
  if (!apiUrl) throw new Error('GEMINI_MODEL_ENDPOINT is not defined in environment variables');

  const requestBody = {
    contents: [{ parts: [{ text: buildSummaryPrompt(input) }] }],
    tools: [{ url_context: {} }],
    generationConfig: {
      maxOutputTokens: 4000,
      thinkingConfig: MINIMAL_THINKING,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          found: { type: 'BOOLEAN' },
          ...Object.fromEntries(SUMMARY_LOCALES.map(l => [l, textSchema])),
        },
        required: ['found'],
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
    { deadlineMs: GEMINI_DEADLINE_MS }
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
    log.error('Gemini could not read the BOCG PDF:', input.pdfUrl, statuses);
    throw new PdfNotReadError(statuses);
  }

  const generatedText = getResponseText(data);
  if (!generatedText) throw new Error('Gemini returned an empty response');

  try {
    return normalizeSummary(JSON.parse(generatedText));
  } catch (parseError) {
    log.error('Failed to parse Gemini summary as JSON:', parseError, generatedText);
    throw new Error('Failed to parse Gemini response as JSON');
  }
}
