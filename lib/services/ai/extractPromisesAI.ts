import { ExtractedSubjectPromises, Subject } from "@/types/politicalParties";
import { Logger } from "tslog";

const log = new Logger();

export const MAX_PROMISES_PER_SUBJECT = 5;

type RawExtraction = { subject_id?: unknown; promises?: unknown }[];

/**
 * Keeps the AI output inside the rules: only known subjects, trimmed unique promises,
 * at most MAX_PROMISES_PER_SUBJECT each. Returns one entry per subject, in the subjects' order.
 */
export function normalizeExtraction(raw: unknown, subjects: Pick<Subject, "id" | "name">[]): ExtractedSubjectPromises[] {
  const bySubject = new Map<number, string[]>();

  if (Array.isArray(raw)) {
    for (const entry of raw as RawExtraction) {
      const subjectId = Number(entry?.subject_id);
      if (!subjects.some((s) => s.id === subjectId) || !Array.isArray(entry?.promises)) continue;

      const current = bySubject.get(subjectId) ?? [];
      for (const promise of entry.promises) {
        if (typeof promise !== "string") continue;
        const text = promise.trim();
        if (text && !current.some((p) => p.toLowerCase() === text.toLowerCase())) current.push(text);
      }
      bySubject.set(subjectId, current);
    }
  }

  return subjects.map((s) => ({
    subject_id: s.id,
    subject_name: s.name,
    promises: (bySubject.get(s.id) ?? []).slice(0, MAX_PROMISES_PER_SUBJECT),
  }));
}

/** Sends the campaign PDF to Gemini and returns at most 5 key promises per subject. */
export async function extractPromisesFromPdf(pdfBase64: string, subjects: Subject[]): Promise<ExtractedSubjectPromises[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not defined in environment variables");
  const apiUrl = process.env.GEMINI_MODEL_ENDPOINT;
  if (!apiUrl) throw new Error("GEMINI_MODEL_ENDPOINT is not defined in environment variables");

  const subjectList = subjects.map((s) => `- subject_id ${s.id}: ${s.name} — ${s.description}`).join("\n");

  const prompt = `
    Eres un analista político neutral. El PDF adjunto es el programa electoral de un partido político español.

    TAREA:
    Para CADA uno de estos temas, extrae como MÁXIMO ${MAX_PROMISES_PER_SUBJECT} promesas, las más importantes del programa:
    ${subjectList}

    REGLAS ESTRICTAS:
    - Solo promesas que aparecen explícitamente en el PDF. No inventes ni deduzcas.
    - Prioriza promesas concretas y verificables (medidas, leyes, cifras, plazos) sobre declaraciones genéricas.
    - Una frase clara por promesa, en español, fiel al texto del programa y sin valoraciones.
    - Cada promesa va en el tema que mejor encaje y en un solo tema. No repitas promesas.
    - Usa solo los subject_id de la lista. Si un tema no tiene promesas relevantes, devuelve una lista vacía.
  `;

  const requestBody = {
    contents: [
      {
        parts: [{ inlineData: { mimeType: "application/pdf", data: pdfBase64 } }, { text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 16000,
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            subject_id: { type: "INTEGER" },
            promises: { type: "ARRAY", items: { type: "STRING" } },
          },
          required: ["subject_id", "promises"],
        },
      },
    },
  };

  const response = await fetch(`${apiUrl}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    log.error(`Gemini API error: ${response.status} ${response.statusText}`, errorText);
    if (response.status === 429) throw new Error("Rate limit hit. Please wait and try again.");
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const generatedText: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!generatedText) {
    log.error("Gemini response does not contain expected text content:", data);
    throw new Error("Gemini returned an empty response");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(generatedText);
  } catch (parseError) {
    log.error("Failed to parse Gemini response as JSON:", parseError, generatedText);
    throw new Error("Failed to parse Gemini response as JSON");
  }

  return normalizeExtraction(parsed, subjects);
}
