import { PartyWithPromises } from "@/types/politicalParties";
import { VotingData } from "@/types/proposal.types";
import { Logger } from "tslog";

const log = new Logger();

type FulfillmentStatus = "Supporting Evidence" | "Contradictory Evidence" | "Partial/Indirect Evidence";

interface PromiseAnalysis {
  promise_id: number;
  subject_id: number;
  promise_text: string;
  // Use the defined type for fulfillment_status
  fulfillment_status: FulfillmentStatus;
  // Combine the details and evidence into one field
  analysis_summary: string;
}

interface PartyAnalysisOutput {
  party_id: number;
  party_name: string;
  party_abbreviation: string;
  campaign_year: number;
  promise_analyses: PromiseAnalysis[];
}

export async function analyzePromisesWithGemini(partiesToAnalyze: PartyWithPromises[], proposalData: VotingData): Promise<PartyAnalysisOutput[]> {
  try {
    if (!proposalData) throw new Error("You need to send Proposal Data");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }

    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    // Use your latest refined prompt here (e.g., the one from Option 1 above)
    // It's still good to have the best possible prompt to get the analysis part right,
    // even if the filtering is done client-side.
    const prompt = `
Eres un sistema de análisis automatizado, diseñado para evaluar el cumplimiento de promesas electorales de partidos políticos en España basándose en datos públicamente disponibles sobre su actividad parlamentaria, iniciativas legislativas y acciones gubernamentales relevantes (cuando sea aplicable a su posición).

Se te proporcionarán las instrucciones y, A CONTINUACIÓN, dos bloques de datos en formato JSON en partes separadas:
1. Información de los partidos y sus promesas de campaña de 2023.
2. Información de las votaciones de un tema específico en el Congreso, incluyendo el voto de cada grupo parlamentario relevante.

Tu tarea es:
1.  Procesar los datos JSON proporcionados.
2.  Para CADA PROMESA de cada partido, analizar si la votación proporcionada ('proposalData') y su contexto directo ofrecen evidencia (a favor o en contra) para esa promesa.
3.  Si se encuentra una conexión significativa y evidencia relevante DIRECTAMENTE ASOCIADA A ESTA VOTACIÓN ESPECÍFICA para una promesa, generar un objeto 'PromiseAnalysis' con los campos ('promise_id', 'subject_id', 'promise_text', 'fulfillment_status', 'analysis_summary').

    **REGLAS PARA 'fulfillment_status':** Debes asignar *estrictamente* uno de los siguientes valores STRING:
    * "Supporting Evidence": Si el voto específico del partido en esta propuesta proporciona evidencia directa que apoya el cumplimiento de la promesa.
    * "Contradictory Evidence": Si el voto específico del partido en esta propuesta proporciona evidencia directa que contradice el cumplimiento de la promesa.
    * "Partial/Indirect Evidence": Si el voto específico del partido en esta propuesta es sobre un tema relacionado y ofrece evidencia parcial o indirecta sobre el cumplimiento de la promesa.
    * NO uses ningún otro valor.

    **REGLAS PARA 'analysis_summary':** Debes generar un string conciso que explique:
    * La conexión entre la promesa y la votación específica.
    * La naturaleza de la evidencia encontrada en el voto (si apoya, contradice o es parcial/indirecta).
    * Por qué se asignó el 'fulfillment_status' elegido basándose *únicamente* en esta votación.
    * Este campo reemplaza la información antes contenida en 'analysis_details' y 'evidence_summary'.

4.  **GENERACIÓN DEL ARRAY JSON DE SALIDA FINAL (REGLA ABSOLUTA):**
    * Para cada partido en los datos de entrada:
        * Realiza el análisis de todas sus promesas (según pasos 2 y 3) para construir un array temporal de 'PromiseAnalysis' para ese partido.
        * **DECISIÓN CLAVE:** Si este array temporal de 'PromiseAnalysis' para el partido está VACÍO, entonces este partido **NO DEBE SER INCLUIDO DE NINGUNA FORMA** en el array JSON de salida final. OMITE COMPLETAMENTE cualquier objeto o mención de este partido.
        * **SOLO SI** el array temporal de 'PromiseAnalysis' para el partido **NO ESTÁ VACÍO**, entonces y solo entonces, crea un objeto de partido para incluir en el array JSON de salida final. Este objeto de partido DEBE contener 'party_id', 'party_name', 'party_abbreviation', 'campaign_year', un 'overall_analysis_summary' apropiado para los hallazgos *de esta votación específica* para ese partido, y el array 'promise_analyses' (que será el array temporal no vacío).
    * El array JSON de salida final que generes DEBE SER un array que contenga ÚNICAMENTE los objetos de partido que cumplieron la condición del paso 4.c.
    * **Si NINGÚN partido cumple la condición 4.c, el resultado debe ser un array JSON vacío: []**

5.  Tu análisis debe ser imparcial, no ideológico y estrictamente racional. No introduzcas opiniones ni interpretaciones subjetivas.

Fuentes de Datos Autorizadas:
* Sitio web del Congreso de los Diputados (congreso.es).
* Boletines Oficiales del Estado (BOE).
* Registros públicos y debates parlamentarios.
* Archivos de noticias reputadas sobre acciones legislativas (verificando en múltiples fuentes).
* **La información JSON sobre votaciones proporcionada.**

Formato de Salida:
Debes responder ÚNICAMENTE con un array JSON. Este array JSON debe seguir la estructura descrita abajo y OBEDECER ESTRICTAMENTE LA REGLA ABSOLUTA del punto 4 para la inclusión de partidos.

JSON
[
  // SI NINGÚN PARTIDO TIENE UN ARRAY 'promise_analyses' NO VACÍO, ESTE ARRAY DEBE SER [].
  // CADA OBJETO DE PARTIDO LISTADO AQUÍ DEBE OBLIGATORIAMENTE TENER 'promise_analyses' CON AL MENOS UN ELEMENTO.
  {
    "party_id": integer,
    "party_name": "string",
    "party_abbreviation": "string",
    "campaign_year": integer,
    "promise_analyses": [ // ESTE ARRAY NUNCA DEBE ESTAR VACÍO PARA UN PARTIDO INCLUIDO.
      {
        "promise_id": integer,
        "subject_id": integer,
        "promise_text": "string",
        "fulfillment_status": "Supporting Evidence" | "Contradictory Evidence" | "Partial/Indirect Evidence", // UNO DE ESTOS VALORES STRING
        "analysis_summary": "string" // Combinación de análisis y evidencia del voto
      }
      // ... más análisis de promesas si hay múltiples relevantes.
    ]
  }
  // ... más objetos de partido, PERO SOLO SI 'promise_analyses' NO ESTÁ VACÍO.
]
`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }, { text: JSON.stringify(partiesToAnalyze) }, { text: JSON.stringify(proposalData) }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      },
    };

    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error(`Gemini API error: ${response.status} ${response.statusText}`, errorText);
      if (response.status === 429) {
        log.warn(`Rate limit hit, waiting 10 seconds before recommending retry...`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        throw new Error(`Rate limit hit. Please wait and try again.`);
      }
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      log.error("Gemini response does not contain expected text content:", data);
      throw new Error("Gemini response does not contain expected text content or is empty");
    }

    generatedText = generatedText.trim();
    const jsonPrefix = "```json\n";
    if (generatedText.startsWith(jsonPrefix)) {
      generatedText = generatedText.substring(jsonPrefix.length);
    }
    const jsonSuffix = "\n```";
    if (generatedText.endsWith(jsonSuffix) && generatedText.length >= jsonSuffix.length) {
      generatedText = generatedText.substring(0, generatedText.length - jsonSuffix.length);
    }

    log.info("Attempting to parse CLEANED text as JSON:", generatedText);
    let analysisResult: PartyAnalysisOutput[];
    try {
      analysisResult = JSON.parse(generatedText);
    } catch (parseError) {
      log.error("Failed to parse Gemini response as JSON after cleaning:", parseError, "Cleaned text causing error:", generatedText);
      throw new Error("Failed to parse Gemini response as JSON after cleaning");
    }

    // **CLIENT-SIDE FILTERING ADDED HERE**
    const filteredResult = analysisResult.filter((partyAnalysis) => partyAnalysis.promise_analyses && partyAnalysis.promise_analyses.length > 0);

    if (analysisResult.length > 0 && filteredResult.length === 0) {
      log.info("All parties were filtered out because their promise_analyses were empty. Returning empty array.");
    } else if (analysisResult.length !== filteredResult.length) {
      log.info(`Filtered out ${analysisResult.length - filteredResult.length} parties with empty promise_analyses.`);
    }

    return filteredResult; // Return the filtered result
  } catch (error) {
    log.error("Error analyzing promises with Gemini:", error);
    if (error instanceof Error && error.message.includes("Rate limit hit")) {
      throw error;
    }
    throw new Error(`Error general al analizar promesas: ${error}`);
  }
}
