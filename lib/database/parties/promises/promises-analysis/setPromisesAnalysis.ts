import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { PartyAnalysisOutput } from "@/types/politicalParties";
import { getPromiseAnalysis } from "./getPromiseAnalysis";
const log = new Logger();

export async function setPromiseAnalysis(promiseAnalysis: PartyAnalysisOutput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ids: any[] = [];
  try {
    const { party_id, party_name, campaign_year, promise_analyses } = promiseAnalysis;

    promise_analyses.forEach(async (analysis) => {
      const { promise_id, proposal_id, subject_id, promise_text, fulfillment_status, analysis_summary } = analysis;

      const { analysis: promiseAnalysis } = await getPromiseAnalysis(party_id, promise_id);

      const isSaved = promiseAnalysis && promiseAnalysis.length > 0;

      if (!isSaved) {
        const { data, error: insertError } = await supabaseAdmin
          .from("promise_status")
          .insert([
            {
              promise_id,
              proposal_id,
              subject_id,
              promise_text,
              fulfillment_status,
              analysis_summary,
              party_id,
              party_name,
              campaign_year,
            },
          ])
          .select("id")
          .single();

        if (insertError) {
          log.error(`Error inserting promise analysis:`, insertError);
          throw insertError;
        }

        ids.push(data.id);
      }
    });

    return ids;
  } catch (error) {
    log.error("Supabase error inserting promise analysis:", error);
    return { error };
  }
}
