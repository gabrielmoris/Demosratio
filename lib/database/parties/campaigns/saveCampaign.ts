import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

/** Adds a party to a legislatura. Fails with 23505 if the party already has a campaign in it. */
export const saveCampaign = async (year: number, party_id: number, campaign_pdf_url: string, legislatura_id: number) => {
  const { data: result, error: insertError } = await supabaseAdmin
    .from("campaigns")
    .insert([
      {
        year,
        campaign_pdf_url,
        party_id,
        legislatura_id,
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
