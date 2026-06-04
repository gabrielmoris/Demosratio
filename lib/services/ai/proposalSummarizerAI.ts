import { Logger } from 'tslog';

const log = new Logger();

interface ProposalSummaryInput {
 title: string;
 expedient_text: string;
 votes_for: number;
 votes_against: number;
 abstentions: number;
 assent: boolean;
}

export interface ProposalSummaryOutput {
 bullet_points: string[];
 one_line: string;
}

export async function summarizeProposalWithGemini(
 proposal: ProposalSummaryInput,
 retryCount = 2
): Promise<ProposalSummaryOutput | null> {
 try {
 const apiKey = process.env.GEMINI_API_KEY;
 if (!apiKey) {
 throw new Error('GEMINI_API_KEY is not defined in environment variables');
 }

 const apiUrl = process.env.GEMINI_MODEL_ENDPOINT;

 const prompt = `
Eres un asistente que explica propuestas del Congreso español en lenguaje ciudadano claro y sencillo.

INPUT:
- Título de la propuesta: ${proposal.title}
- Código de expediente: ${proposal.expedient_text}
- Resultado: ${proposal.assent ? 'Aprobada' : 'Rechazada'} (${proposal.votes_for} a favor, ${proposal.votes_against} en contra, ${proposal.abstentions} abstenciones)

TAREA:
1. Explica en 3-5 bullet points concisos (máximo 15 palabras cada uno) de qué trata esta propuesta y qué se votó.
2. Escribe una frase resumen de máximo 20 palabras.

REGLAS ESTRICTAS:
- Lenguaje ciudadano, sin jerga legal ni política
- Basate en el título y tu conocimiento de la legislación española
- Si no estás seguro del contenido exacto, sé genérico pero honesto ("Trata sobre modificaciones en la legislación de...")
- NO inventes detalles específicos que no se puedan inferir del título
- NO añadas opiniones ni juicios de valor
- Responde SOLO en JSON, sin markdown ni bloques de código

FORMATO JSON SALIDA:
{
 "bullet_points": ["punto 1", "punto 2", "punto 3"],
 "one_line": "frase resumen"
}`;

 const requestBody = {
 contents: [
 {
 parts: [{ text: prompt }],
 },
 ],
 generationConfig: {
 temperature: 0.3,
 topP: 0.8,
 topK: 20,
 maxOutputTokens: 500,
 },
 };

 const response = await fetch(`${apiUrl}?key=${apiKey}`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(requestBody),
 });

 if (!response.ok) {
 const errorText = await response.text();
 log.error(`Gemini API error: ${response.status} ${response.statusText}`, errorText);
 if (response.status === 429) {
 log.warn('Rate limit hit, waiting 10 seconds...');
 await new Promise((resolve) => setTimeout(resolve, 10000));
 throw new Error('Rate limit hit. Please wait and try again.');
 }
 throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
 }

 const data = await response.json();
 let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

 if (!generatedText) {
 log.error('Gemini response does not contain expected text:', data);
 throw new Error('Empty Gemini response');
 }

 // Clean markdown code fences if present
 generatedText = generatedText.trim();
 const jsonPrefix = '```json\n';
 if (generatedText.startsWith(jsonPrefix)) {
 generatedText = generatedText.substring(jsonPrefix.length);
 }
 const jsonSuffix = '\n```';
 if (generatedText.endsWith(jsonSuffix) && generatedText.length >= jsonSuffix.length) {
 generatedText = generatedText.substring(0, generatedText.length - jsonSuffix.length);
 }

 let result: ProposalSummaryOutput;
 try {
 result = JSON.parse(generatedText);
 } catch (parseError) {
 log.error('Failed to parse Gemini response as JSON:', parseError, 'Text:', generatedText);
 throw new Error('Failed to parse Gemini response as JSON');
 }

 if (!result.bullet_points || !Array.isArray(result.bullet_points) || result.bullet_points.length === 0) {
 log.error('Invalid summary format:', result);
 throw new Error('Invalid summary format from Gemini');
 }

 return result;
 } catch (error) {
 log.error('Error summarizing proposal with Gemini:', error);
 if (retryCount > 0) {
 log.info(`Retrying... (${retryCount} attempts remaining)`);
 await new Promise((resolve) => setTimeout(resolve, 3000));
 return summarizeProposalWithGemini(proposal, retryCount - 1);
 }
 return null;
 }
}
