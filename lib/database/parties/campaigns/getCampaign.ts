import { Logger } from "tslog";

import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function fetchCampaign(party_id: number) {
  try {
    const { data: campaign, error: campaignsError } = await supabaseAdmin.from("campaigns").select("*").eq("party_id", party_id).single();

    if (campaignsError) {
      throw new Error("Error fetching campaign");
    }

    return { campaign };
  } catch (error) {
    log.error("Supabase error: ", error);
    return { error };
  }
}
