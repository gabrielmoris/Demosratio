import { Logger } from "tslog";
import { VotingData } from "@/types/proposal.types";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

/**
 * Check if a proposal with the given expedient_text already exists in the database.
 * Returns the existing proposal ID if found, null otherwise.
 */
export async function checkProposalExists(expedient_text: string): Promise<{ id: number } | null> {
  const { data: checkResult, error: checkError } = await supabaseAdmin.from("proposals").select("id").eq("expedient_text", expedient_text).limit(1);

  if (checkError) {
    log.error("Error checking for existing proposal:", checkError);
    throw checkError;
  }

  if (checkResult && checkResult.length > 0) {
    return { id: checkResult[0].id };
  }

  return null;
}

export async function saveProposalToDb(proposalData: VotingData) {
  try {
    const {
      session,
      date,
      title,
      url,
      expedient_text,
      parliament_presence,
      votes_for,
      votes_against,
      no_vote,
      assent,
      abstentions,
      votes_parties_json,
    } = proposalData;

    // Save the new proposal (check should be done before calling this function)
    const { data: result, error: insertError } = await supabaseAdmin
      .from("proposals")
      .insert([
        {
          title,
          url,
          session,
          expedient_text,
          parliament_presence,
          votes_for,
          abstentions,
          votes_against,
          no_vote,
          assent,
          date,
          votes_parties_json,
        },
      ])
      .select("id")
      .single();

    if (insertError) {
      log.error(`Error inserting proposal:`, insertError);
      throw insertError;
    }

    if (result) {
      log.info(`Proposal "${title}" saved with ID: ${result.id}`);
      return { id: result.id, alreadySavedBefore: false };
    } else {
      log.warn(`Proposal "${title}" was not saved.`);
      return null;
    }
  } catch (error) {
    log.error(`Error saving proposal to database:`, error);
    throw error;
  }
}
