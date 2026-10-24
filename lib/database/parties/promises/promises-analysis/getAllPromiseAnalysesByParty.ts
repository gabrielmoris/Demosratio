import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { PromiseAnalysis } from "@/types/politicalParties";

const log = new Logger();

/** Analyses of a party's promises; only those of `campaignId` (its campaign in a legislatura) when given. */
export async function getAllPromiseAnalysesByParty(
  partyId: number,
  campaignId?: number
): Promise<{ analysis: PromiseAnalysis[] | null; error?: Error }> {
  if (!partyId) throw new Error("partyId is required");

  try {
    let query = supabaseAdmin
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
        )${campaignId ? ",\n        promises!inner (campaign_id)" : ""}
      `,
      )
      .eq("party_id", partyId);

    if (campaignId) query = query.eq("promises.campaign_id", campaignId);

    const { data: analyses, error: analysisError } = await query
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
