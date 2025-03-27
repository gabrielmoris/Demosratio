import { Logger } from "tslog";

import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function fetchCampaign(year: number, party_id: number) {
  try {
    // Count likes
    const { data: campaign, error: campaignsError } = await supabaseAdmin
      .from("campaigns")
      .select("*")
      .eq("party_id", party_id)
      .eq("year", year)
      .single();

    if (campaignsError) {
      throw new Error("Error fetching campaign");
    }

    return { campaign };
  } catch (error) {
    log.error("Supabase error: ", error);
    return { error };
  }
}
