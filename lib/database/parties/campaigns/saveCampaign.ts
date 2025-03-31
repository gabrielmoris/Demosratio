import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export const saveCampaign = async (year: number, party_id: number, campaign_pdf_url: string) => {
  const { data: result, error: insertError } = await supabaseAdmin
    .from("campaigns")
    .insert([
      {
        year,
        campaign_pdf_url,
        party_id,
      },
    ])
    .select("id")
    .single();

  if (insertError) {
    log.error(`Error inserting subject:`, insertError);
    throw insertError;
  }

  return result;
};
