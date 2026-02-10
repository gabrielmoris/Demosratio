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

    const prompt = `
      Analiza si las votaciones del Congreso español cumplen promesas electorales de 2023.
      
      INPUT:
      1. Partidos políticos con sus promesas de campaña 2023
      2. Una votación específica con: título, expediente y votos de cada partido
      
      TAREA:
      Para CADA promesa de cada partido, determina si ESTA votación proporciona evidencia DIRECTA de:
      - "Supporting Evidence": el voto apoya cumplimiento de la promesa
      - "Contradictory Evidence": el voto contradice la promesa
      - Sin evidencia directa: NO incluyas la promesa en el resultado
      
      REGLAS ESTRICTAS:
      - Analiza cada promesa individualmente contra el voto específico de ESTA votación
      - La evidencia debe ser EXPLÍCITA del contenido de la promesa y del sentido del voto
      - NO inferir ni extrapolar más allá de lo claro en la promesa y el voto
      - Si la relación es ambigua o tangencial → NO hay evidencia
      - Sin opiniones ideológicas ni suposiciones sobre estrategias políticas
      - Objetivo e imparcial
      
      FORMATO JSON SALIDA (array de partidos con análisis):
      [
        {
          "party_id": integer,
          "party_name": "string",
          "party_abbreviation": "string",
          "campaign_year": 2023,
          "promise_analyses": [
            {
              "promise_id": integer,
              "subject_id": integer,
              "promise_text": "string",
              "fulfillment_status": "Supporting Evidence" | "Contradictory Evidence",
              "analysis_summary": "string"
            }
          ]
        }
      ]
      
      REGLAS DE SALIDA:
      - Si un partido NO tiene ninguna promesa con evidencia directa → NO incluyas ese partido
      - Si ningún partido tiene evidencia → devuelve [] vacío
      - Cada promise_analyses DEBE tener mínimo 1 elemento
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
        maxOutputTokens: 16384,
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
