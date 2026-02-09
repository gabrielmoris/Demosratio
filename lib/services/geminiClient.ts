import { PartyAnalysisOutput, PartyWithPromises } from "@/types/politicalParties";
import { VotingData } from "@/types/proposal.types";
import { Logger } from "tslog";

const log = new Logger();

export async function analyzePromisesWithGemini(partiesToAnalyze: PartyWithPromises[], proposalData: VotingData): Promise<PartyAnalysisOutput[]> {
  try {
    if (!proposalData) throw new Error("You need to send Proposal Data");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }

    const apiUrl = process.env.GEMINI_MODEL_ENDPOINT;

    // Use your latest refined prompt here (e.g., the one from Option 1 above)
    // It's still good to have the best possible prompt to get the analysis part right,
    // even if the filtering is done client-side.
    const prompt = `
      Eres un sistema de análisis automatizado, diseñado para evaluar el cumplimiento de promesas electorales de partidos políticos en España basándote EXCLUSIVAMENTE en los datos JSON proporcionados sobre:
      - Promesas de campaña de electoral de cada partido.
      - Votaciones de un tema específico en el Congreso ('proposalData'), incluyendo el voto de cada grupo parlamentario relevante.

      Tu tarea es:

      1. Procesar los datos JSON proporcionados.
        - Primero se te enviarán los datos de partidos y sus promesas de campaña de 2023.
        - A continuación se te enviarán los datos de las votaciones de un tema específico ('proposalData').

      2. Para CADA PROMESA de cada partido, analizar si la votación proporcionada ('proposalData') ofrece evidencia DIRECTA, CLARA y ESPECÍFICA de apoyo o de contradicción respecto a esa promesa.
        - La evidencia debe derivarse de forma explícita del contenido de la promesa y del sentido del voto del partido en ESTA VOTACIÓN CONCRETA.
        - NO debes inferir ni extrapolar más allá de lo que se desprende claramente de la descripción de la promesa y del voto (por ejemplo, no uses interpretaciones ideológicas ni suposiciones sobre estrategias políticas generales).
        - Si la relación entre la promesa y la votación es ambigua, indirecta, o solo tangencial, entonces debes considerar que NO hay evidencia suficiente.

      3. Solo cuando exista una conexión significativa y evidencia DIRECTA en ESTA VOTACIÓN ESPECÍFICA para una promesa concreta de un partido, generarás un objeto 'PromiseAnalysis' con los campos:
        - 'promise_id'
        - 'subject_id'
        - 'promise_text'
        - 'fulfillment_status'
        - 'analysis_summary'

        **REGLAS PARA 'fulfillment_status':** Debes asignar *estrictamente* uno de los siguientes valores STRING:
        - "Supporting Evidence": si el voto específico del partido en esta propuesta proporciona evidencia directa que apoya el cumplimiento de la promesa.
        - "Contradictory Evidence": si el voto específico del partido en esta propuesta proporciona evidencia directa que contradice el cumplimiento de la promesa.
        - NO uses ningún otro valor.
        - Si NO hay evidencia directa de apoyo o contradicción, NO generes ningún 'PromiseAnalysis' para esa promesa (simplemente no la incluyas).

        **REGLAS PARA 'analysis_summary':** Debes generar un string conciso que explique:
        - La conexión entre la promesa y la votación específica.
        - La naturaleza de la evidencia encontrada en el voto (si apoya o contradice).
        - Por qué se asignó el 'fulfillment_status' elegido basándose *únicamente* en esta votación.
        - Este campo sustituye cualquier campo previo como 'analysis_details' o 'evidence_summary'.

      4. GENERACIÓN DEL ARRAY JSON DE SALIDA FINAL (REGLA ABSOLUTA):
        - Para cada partido de los datos de entrada:
          - Analiza todas sus promesas (según pasos 2 y 3) y construye un array temporal 'promise_analyses' que contenga SOLO las promesas para las que hayas identificado evidencia DIRECTA de apoyo o contradicción en esta votación.
          - **DECISIÓN CLAVE:** Si este array temporal 'promise_analyses' para el partido está VACÍO (es decir, no hay ninguna promesa con evidencia directa de apoyo o contradicción en la votación analizada), entonces este partido **NO DEBE SER INCLUIDO DE NINGUNA FORMA** en el array JSON de salida final. Omite completamente cualquier objeto o mención de este partido.
          - **SOLO SI** el array temporal 'promise_analyses' para el partido **NO ESTÁ VACÍO**, entonces y solo entonces, crea un objeto de partido para incluir en el array JSON de salida final. Este objeto de partido DEBE contener:
            - 'party_id'
            - 'party_name'
            - 'party_abbreviation'
            - 'campaign_year'
            - 'promise_analyses' (el array temporal NO vacío con las promesas que tienen evidencia directa).

        - El array JSON de salida final que generes DEBE SER un array que contenga ÚNICAMENTE los objetos de partido que cumplan la condición anterior (tener 'promise_analyses' NO vacío).
        - **Si NINGÚN partido tiene evidencias directas de apoyo o contradicción para alguna de sus promesas en esta votación (y por tanto todos los 'promise_analyses' de todos los partidos están vacíos), el resultado debe ser un array JSON vacío: []**

      5. Tu análisis debe ser imparcial, no ideológico y estrictamente racional. No introduzcas opiniones ni interpretaciones subjetivas.

      6. Fuentes de datos autorizadas:
        - EXCLUSIVAMENTE la información JSON sobre promesas y votaciones proporcionada en este contexto para realizar el análisis.
        - No utilices ninguna otra fuente externa ni conocimiento adicional.

      Formato de salida:
      Debes responder ÚNICAMENTE con un array JSON que siga la siguiente estructura y OBEDEZCA ESTRICTAMENTE LA REGLA DEL PUNTO 4:

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
              "fulfillment_status": "Supporting Evidence" | "Contradictory Evidence", // UNO DE ESTOS VALORES STRING
              "analysis_summary": "string" // Explica brevemente la conexión directa entre la promesa y el voto, y por qué se considera evidencia de apoyo o contradicción
            }
            // ... más análisis de promesas solo si hay evidencia directa en esta votación.
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
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
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

    log.info("Attempting to parse CLEANED text as JSON");
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
