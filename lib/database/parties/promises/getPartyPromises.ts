import { Logger } from "tslog";

import { supabaseAdmin } from "@/lib/supabaseClient";
import { PartyPromise } from "@/types/politicalParties";

const log = new Logger();

export async function fetchPartyPromises(party_id: number, campaign_id: number): Promise<{ promises: PartyPromise[] }> {
  try {
    const { data: promises, error: promisesError } = await supabaseAdmin
      .from("promises")
      .select(`*`)
      .eq("campaign_id", campaign_id)
      .eq("party_id", party_id);

    if (promisesError) {
      log.error(`Error gettting party ID: `, promisesError);
      throw promisesError;
    }

    return { promises };
  } catch (error) {
    log.error("Supabase error fetching promises:", error);
    throw new Error("Supabase error fetching promises");
  }
}
