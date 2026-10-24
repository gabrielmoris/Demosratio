import { Logger } from "tslog";

import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

/** Campaigns of a party; only the one in `legislaturaId` when given. */
export async function fetchCampaign(party_id: number, legislaturaId?: number) {
  try {
    let query = supabaseAdmin.from("campaigns").select("*").eq("party_id", party_id);
    if (legislaturaId) query = query.eq("legislatura_id", legislaturaId);

    const { data: campaignsOfParty, error: campaignsError } = await query;

    if (campaignsError) {
      throw new Error("Error fetching campaign");
    }

    return { campaignsOfParty };
  } catch (error) {
    log.error("Supabase error: ", error);
    return { error };
  }
}
