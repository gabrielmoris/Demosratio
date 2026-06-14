import { supabaseAdmin } from "@/lib/supabaseClient";
import { Logger } from "tslog";

const log = new Logger();

export const getProposalById = async (id: number) => {
  try {
    const { data: proposal, error } = await supabaseAdmin
      .from("proposals")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      log.error("Supabase error:", error);
      throw new Error("Error fetching proposal");
    }

    if (!proposal) {
      throw new Error("Proposal not found.");
    }

    if (proposal?.votes_parties_json?.votes) {
      proposal.votes_parties_json = proposal.votes_parties_json.votes;
    }

    const { data: relatedPromises, error: promisesError } = await supabaseAdmin
      .from("promise_status")
      .select("promise_id, promise_text, fulfillment_status, analysis_summary, party_name, campaign_year")
      .eq("proposal_id", id);

    if (promisesError) {
      log.error("Error fetching related promises:", promisesError);
    }

    proposal.relatedPromises = relatedPromises ?? [];

    return proposal;
  } catch (e) {
    log.error(e);
  }
};
