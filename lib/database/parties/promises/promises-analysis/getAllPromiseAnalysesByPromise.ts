import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function getAllPromiseAnalysesByPromise(party_id: number, promise_id: number) {
  if (!party_id || !promise_id) throw new Error("you need to send the args!");

  try {
    const { data: analysis, error: analysisError } = await supabaseAdmin
      .from("promise_status")
      .select(
        `
        id,
        promise_id,
        party_name,
        subject_id,
        proposal_id,
        campaign_year,
        promise_text,
        analysis_summary,
        fulfillment_status,
        created_at,
        proposals (
          id,
          title,
          votes_for,
          votes_against,
          expedient_text,
          url
        )
      `,
      )
      .eq("party_id", party_id)
      .eq("promise_id", promise_id)
      .order("created_at", { ascending: false });

    if (analysisError) {
      log.error(`Error getting all promise analyses: `, analysisError);
      throw analysisError;
    }

    return { analysis };
  } catch (error) {
    log.error("Supabase error fetching all promise analyses:", error);
    return { error };
  }
}
