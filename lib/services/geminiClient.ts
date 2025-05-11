import { Party } from "@/types/politicalParties";
import { Logger } from "tslog";

const log = new Logger();

interface GeminiPromiseAnalysisOutput {
  promise_id: number;
  fullfillment_status: "supported" | "opposed" | "abstained" | "no_vote" | "not_addressed_attempted" | "not_addressed_no_attempt";
  analysis_text: string;
}

export async function analyzePromisesWithGemini(partiesToAnalyze: Party[]): Promise<GeminiPromiseAnalysisOutput[]> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }

    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

    const partiesDataForPrompt = JSON.stringify(partiesToAnalyze, null, 2);
    const currentDate = new Date().toISOString().split("T")[0];
    const campaignYearToAnalyze = partiesToAnalyze[0].campaign_year;

    const prompt = `
Eres un analista político experto y objetivo, especializado en la evaluación del cumplimiento de promesas electorales por parte de los partidos políticos, basándote estrictamente en sus acciones parlamentarias (votaciones, propuestas de ley, enmiendas) y documentos programáticos. Tu análisis debe ser rigurosamente imparcial, racional, y desprovisto de cualquier sesgo ideológico. Opera como una máquina de análisis de datos.

A continuación, se te proporciona una lista de partidos políticos españoles, junto con la URL a su programa electoral de la campaña de ${campaignYearToAnalyze}:

PARTIDOS Y PROGRAMAS:
${partiesDataForPrompt}

Para CADA UNO de los partidos listados:
1.  Consulta su programa electoral (accesible mediante 'campaign_pdf_url') para identificar las promesas clave. Dada la posible extensión de los programas, céntrate en las propuestas más concretas y verificables que se puedan rastrear en la actividad parlamentaria.
2.  Investiga las actividades parlamentarias del partido desde la campaña de ${campaignYearToAnalyze} (aproximadamente desde mediados de ${campaignYearToAnalyze}) hasta la fecha actual (${currentDate}). Utiliza fuentes como el sitio web del Congreso de los Diputados (https://www.congreso.es/es/opendata/votaciones), información oficial de los partidos sobre su actividad parlamentaria (notas de prensa, webs oficiales), y noticias de fuentes periodísticas fiables y consolidadas que reporten sobre votaciones y propuestas legislativas. Prioriza la información que puedas verificar.
3.  Evalúa si el partido ha INTENTADO cumplir sus promesas. Considera:
    * Propuestas legislativas (proyectos de ley, proposiciones de ley) presentadas que se alinean con el programa.
    * Votos a favor de iniciativas (propias o de otros grupos) que concuerdan con sus promesas.
    * Votos en contra de iniciativas que contradicen sus promesas.
    * Enmiendas presentadas a legislaciones para alinearlas con sus promesas.
    * Ausencia de acción parlamentaria constatable en áreas prometidas clave.
    * Acciones parlamentarias que puedan ser objetivamente contradictorias con las promesas del programa.

Tu análisis debe ser como el de una máquina: basado en datos, lógico y sin emociones ni opiniones personales. Cita la evidencia de forma concisa.

Responde ÚNICAMENTE en formato JSON. El JSON debe ser un array, donde cada objeto del array representa el análisis para uno de los partidos proporcionados. La estructura para cada objeto de partido debe ser la siguiente:

{
  "party_id": "integer", // ID del partido (e.g., 1)
  "party_name": "string", // Nombre del partido (e.g., "Partido Socialista Obrero Español")
  "party_abbreviation": "string", // Abreviatura del partido (e.g., "GS")
  "campaign_year": "integer", // Año de la campaña analizada (e.g., 2023)
  "campaign_pdf_url": "string", // URL del programa electoral analizado
  "analysis_summary": "string", // Resumen conciso (2-4 frases) de los hallazgos generales sobre el intento de cumplimiento de promesas, basado en la evidencia recopilada.
  "key_promise_areas_analysed": [ // Lista de las principales áreas temáticas de promesas del programa que fueron objeto de análisis (e.g., "Política Fiscal", "Sanidad Pública", "Transición Ecológica").
    "string"
  ],
  "promise_fulfillment_evidence": [ // Array de ejemplos concretos de promesas y la evidencia parlamentaria relacionada.
    {
      "promise_summary": "string", // Breve descripción de una promesa específica identificada en el programa electoral.
      "category": "string", // Clasificación de la evidencia: "Attempted Fulfillment", "Contradictory Action", "Inaction Noted", "Partial Fulfillment".
      "evidence_items": [ // Lista de acciones parlamentarias concretas relacionadas con esta promesa.
        {
          "action_type": "string", // Tipo de acción: e.g., "Propuesta de Ley", "Voto a Favor en Congreso", "Voto en Contra en Senado", "Enmienda Presentada", "Pregunta Parlamentaria", "Debate de Moción".
          "description_of_action": "string", // Detalle de la acción parlamentaria y su contenido relevante.
          "date_of_action": "string", // Fecha de la acción (Formato YYYY-MM-DD, si se conoce). Si es un periodo, indicarlo.
          "source_reference": "string", // Breve descripción de la fuente: e.g., "Diario de Sesiones Congreso [Fecha/Número]", "Nota Prensa Partido [Fecha]", "Artículo [Medio de Comunicación] [Fecha]", "Web Congreso Votación [ID/Título]". No incluyas URLs largas y volátiles; describe la fuente.
          "assessment_of_link_to_promise": "string" // Explicación objetiva y concisa de cómo esta acción específica se relaciona con la promesa (si la apoya, la contradice, o evidencia inacción/acción parcial).
        }
      ]
    }
  ],
  "overall_rational_assessment": {
    "highlights": [ // Lista de 2-4 puntos destacados que ilustran intentos significativos de cumplimiento o coherencia con el programa. Deben ser afirmaciones basadas en la evidencia.
      "string"
    ],
    "downlights": [ // Lista de 2-4 puntos destacados que ilustran contradicciones notables, inacciones en promesas clave, o falta clara de intento de cumplimiento, basados en la evidencia.
      "string"
    ],
    "conclusion": "string" // Conclusión general (1-2 frases) puramente racional y objetiva sobre el grado de intento de cumplimiento, basada en la evidencia analizada. Evitar juicios de valor ideológicos.
  },
  "methodology_notes": {
    "information_sources_used_summary": "string", // Resumen de los tipos de fuentes consultadas (e.g., "Programas electorales PDF, web oficial del Congreso, comunicados de prensa de partidos, noticias de agencias de noticias y periódicos nacionales.").
    "challenges_or_limitations": "string" // Cualquier dificultad encontrada o limitación del análisis (e.g., "Ambigüedad en la formulación de algunas promesas electorales", "Dificultad para rastrear todas las votaciones específicas sobre temas muy granulares sin acceso directo y completo a bases de datos parlamentarias detalladas y clasificadas por tema de programa.", "Análisis basado en información pública hasta ${currentDate}.").
  }
}

Asegúrate de que tu respuesta sea un único bloque JSON válido, comenzando con '[' y terminando con ']'. No incluyas ninguna explicación, introducción o texto adicional fuera del propio JSON. Analiza todos los partidos proporcionados en la sección PARTIDOS Y PROGRAMAS. El análisis debe ser exhaustivo dentro de lo razonable para cada partido.
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
