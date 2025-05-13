import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { PartyAnalysisOutput } from "@/types/politicalParties";
const log = new Logger();

export async function setPromiseAnalysis(promiseAnalysis: PartyAnalysisOutput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ids: any[] = [];
  try {
    const { party_id, party_name, campaign_year, promise_analyses } = promiseAnalysis;

    promise_analyses.forEach(async (analysis) => {
      const { promise_id, subject_id, promise_text, fulfillment_status, analysis_summary } = analysis;

      const { data: id, error: insertError } = await supabaseAdmin
        .from("promise_status")
        .insert([
          {
            promise_id,
            proposal_id: subject_id,
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
        log.error(`Error inserting promise readiness score:`, insertError);
        throw insertError;
      }
      ids.push(id);
    });

    if (!ids.length) throw new Error("No IDs retrieved");
    return ids;
  } catch (error) {
    log.error("Supabase error fetching promise readiness scores:", error);
    return { error };
  }
}
