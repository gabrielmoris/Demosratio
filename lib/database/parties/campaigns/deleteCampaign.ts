import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export const deleteCampaign = async (party_id: number, year: string) => {
  const { data: result, error: insertError } = await supabaseAdmin
    .from("campaigns")
    .delete()
    .eq("party_id", party_id)
    .eq("year", year)
    .select("id")
    .single();

  if (insertError) {
    log.error(`Error deleting subject: `, insertError);
    throw insertError;
  }

  return result;
};
