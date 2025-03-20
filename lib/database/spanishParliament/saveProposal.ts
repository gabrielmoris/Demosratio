import { Logger } from "tslog";
import { VotingData } from "@/types/proposal.types";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

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

    // First check if the expedient_text is already saved
    const { data: checkResult, error: checkError } = await supabaseAdmin
      .from("proposals")
      .select("id")
      .eq("expedient_text", expedient_text)
      .limit(1);

    if (checkError) {
      log.error("Error checking for existing proposal:", checkError);
      throw checkError;
    }

    if (checkResult && checkResult.length > 0) {
      log.warn(
        `Proposal with expedient_text "${expedient_text}" already exists. Skipping.`
      );
      return null;
    }

    // Then save the new proposal
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
      return result.id;
    } else {
      log.warn(`Proposal "${title}" was not saved.`);
      return null;
    }
  } catch (error) {
    log.error(`Error saving proposal to database:`, error);
    throw error;
  }
}
