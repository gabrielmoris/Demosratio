import { Logger } from "tslog";

import { supabaseAdmin } from "@/lib/supabaseClient";
import { fetchPartyByName } from "../getPartybyName";
import { fetchCampaign } from "../campaigns/getCampaign";

const log = new Logger();

export async function fetchPartyPromises(party_name: string, year: number) {
  try {
    const { party } = await fetchPartyByName(party_name);
    const { campaign } = await fetchCampaign(year, party.id);

    const { data: promises, error: promisesError } = await supabaseAdmin
      .from("promises")
      .select("*")
      .eq("campaign_id", campaign.id)
      .eq("party_id", party.id);

    if (promisesError) {
      log.error(`Error gettting party ID: `, promisesError);
      throw promisesError;
    }

    return { promises };
  } catch (error) {
    log.error("Supabase error fetching subjects:", error);
    return { error };
  }
}
