import { Logger } from "tslog";

const log = new Logger();

interface GeminiPromiseAnalysisOutput {
  promise_id: number;
  fullfillment_status: "supported" | "opposed" | "abstained" | "no_vote" | "not_addressed_attempted" | "not_addressed_no_attempt";
  analysis_text: string;
}

export async function analyzePromisesWithGemini(): Promise<GeminiPromiseAnalysisOutput[]> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }

    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

    // Process each batch

    // Construct the prompt for Gemini CHANGE IT!
    const prompt = `
      Eres un analista político experto que evalúa si los partidos políticos cumplen sus promesas electorales basándose en sus votos en el parlamento.

      Analiza las propuestas legislativas del siguiente partido político y determina si el voto del partido está alineado con sus promesas electorales.

     
      Para cada promesa, determina uno de los siguientes estados:
      - "supported": El voto del partido está alineado con la promesa.
      - "opposed": El voto del partido contradice la promesa.
      - "abstained": El partido se abstuvo de votar en un asunto relacionado con su promesa.
      - "no_vote": El partido no votó en un asunto relacionado con su promesa.
      - "not_addressed_attempted": El partido intentó avanzar la promesa en el parlamento relacionada con esta propuesta.
      - "not_addressed_no_attempt": La votación concierne a un tema relacionado, pero no hay indicación de que el partido haya intentado activamente presentar la promesa en esta instancia específica.

      IMPORTANTE: Si la propuesta legislativa no tiene NINGUNA relación con la promesa, clasifícala como "not_addressed_no_attempt".

      IMPORTANTE: Sé muy estricto al determinar si una promesa está relacionada con la propuesta. Solo clasifica como "supported", "opposed", "abstained" o "no_vote" si hay una relación CLARA y DIRECTA entre la promesa y la propuesta.

      Proporciona un análisis conciso para cada promesa, explicando el razonamiento detrás del estado determinado.

      Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
      [
        {
          "promise_id": número,
          "fullfillment_status": uno de los estados mencionados anteriormente,
          "analysis_text": "Texto de análisis conciso en español"
        },
        ...
      ]
      `;

    // Make the API request
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error(`Gemini API error: ${response.status} ${response.statusText}`, errorText);

      // If we hit a rate limit, wait longer and try again
      if (response.status === 429) {
        log.warn(`Rate limit hit, waiting 5 seconds before retrying...`);
        throw new Error(`Rate limit hit`);
      }

      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Extract the generated text from the response
    const generatedText = data.candidates[0].content.parts[0].text;

    // Parse the JSON from the generated text
    // Find the JSON array in the response (it might be surrounded by markdown code blocks or other text)
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      log.error("Could not extract JSON from Gemini response:", generatedText);
      throw new Error("Could not extract JSON from Gemini response");
    }

    return jsonMatch;
  } catch (error) {
    log.error("Error analyzing promises with Gemini:", error);
    throw error;
  }
}
