import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { fetchPartyByName } from "../getPartybyName";

const log = new Logger();

export const saveCampaign = async (
  year: number,
  party_name: string,
  campaign_pdf_url: string
) => {
  const { party } = await fetchPartyByName(party_name);

  const { data: result, error: insertError } = await supabaseAdmin
    .from("campaigns")
    .insert([
      {
        year,
        campaign_pdf_url,
        party_id: party.id,
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
