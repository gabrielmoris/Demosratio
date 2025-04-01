import { Logger } from "tslog";

import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function fetchPartyPromises(party_id: number, campaign_id: number) {
  try {
    const { data: promises, error: promisesError } = await supabaseAdmin
      .from("promises")
      .select(
        `
      *,
      campaigns ( * ),
      subjects ( * )
    `
      )
      .eq("campaign_id", campaign_id)
      .eq("party_id", party_id);

    if (promisesError) {
      log.error(`Error gettting party ID: `, promisesError);
      throw promisesError;
    }

    for (const promise of promises) {
      console.log(promise);
    }

    return { promises };
  } catch (error) {
    log.error("Supabase error fetching subjects:", error);
    return { error };
  }
}
