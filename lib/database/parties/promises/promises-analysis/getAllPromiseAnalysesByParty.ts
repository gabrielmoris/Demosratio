import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { PromiseAnalysis } from "@/types/politicalParties";

const log = new Logger();

export async function getAllPromiseAnalysesByParty(partyId: number): Promise<{ analysis: PromiseAnalysis[] | null; error?: Error }> {
  if (!partyId) throw new Error("partyId is required");

  try {
    const { data: analyses, error: analysisError } = await supabaseAdmin
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
      .eq("party_id", partyId)
      .order("promise_id", { ascending: true })
      .order("created_at", { ascending: false });

    if (analysisError) {
      log.error(`Error getting all promise analyses by party: `, analysisError);
      throw analysisError;
    }

    return { analysis: analyses as unknown as PromiseAnalysis[] };
  } catch (error) {
    log.error("Supabase error fetching all promise analyses by party:", error);
    return { analysis: null, error: error as Error };
  }
}
