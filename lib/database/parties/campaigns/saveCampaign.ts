import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export const saveCampaign = async (
  year: number,
  party_name: string,
  campaign_pdf_url: string
) => {
  const { data: party_id, error: partyError } = await supabaseAdmin
    .from("parties")
    .select("*")
    .eq("name", party_name)
    .select("id")
    .single();

  if (partyError) {
    log.error(`Error gettting party ID: `, partyError);
    throw partyError;
  }

  const { data: result, error: insertError } = await supabaseAdmin
    .from("campaigns")
    .insert([
      {
        year,
        campaign_pdf_url,
        party_id: party_id.id,
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
