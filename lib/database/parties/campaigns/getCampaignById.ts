import { supabaseAdmin } from "@/lib/supabaseClient";
import { Campaign } from "@/types/politicalParties";

export async function fetchCampaignById(campaign_id: number): Promise<Campaign | null> {
  const { data, error } = await supabaseAdmin.from("campaigns").select("*").eq("id", campaign_id).maybeSingle();

  if (error) throw error;

  return data as Campaign | null;
}
