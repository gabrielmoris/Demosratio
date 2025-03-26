import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export const deleteCampaign = async (party_name: number, year: string) => {
  const { data: party_id, error: partyError } = await supabaseAdmin
    .from("parties")
    .select("*")
    .eq("name", party_name)
    .select("id")
    .single();

  if (partyError) {
    log.error(`Error deleting subject: `, partyError);
    throw partyError;
  }

  const { data: result, error: insertError } = await supabaseAdmin
    .from("campaigns")
    .delete()
    .eq("party_id", party_id.id)
    .eq("year", year)
    .select("id")
    .single();

  if (insertError) {
    log.error(`Error deleting subject: `, insertError);
    throw insertError;
  }

  return result;
};
