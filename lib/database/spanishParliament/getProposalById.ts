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
    if (
      proposal &&
      proposal.votes_parties_json &&
      proposal.votes_parties_json.votes
    ) {
      proposal.votes_parties_json = proposal.votes_parties_json.votes;
    }

    return proposal;
  } catch (e) {
    log.error(e);
  }
};
