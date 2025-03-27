import { Logger } from "tslog";

import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function fetchAllCampaigns() {
  try {
    // Count likes
    const { data: campaigns, error: campaignsError } = await supabaseAdmin
      .from("campaigns")
      .select("*");

    if (campaignsError) {
      throw new Error("Error fetching campaigns");
    }

    return { campaigns };
  } catch (error) {
    log.error("Supabase error fetching campaigns:", error);
    return { error };
  }
}
