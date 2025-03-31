import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export const deleteCampaign = async (campaign_id: number) => {
  const { data: result, error: insertError } = await supabaseAdmin
    .from("campaigns")
    .delete()
    .eq("id", campaign_id)
    .select("id")
    .single();

  if (insertError) {
    log.error(`Error deleting subject: `, insertError);
    throw insertError;
  }

  return result;
};
