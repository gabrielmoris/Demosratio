import { Logger } from "tslog";

import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function fetchPartyByName(party_name: string) {
  try {
    const { data: party, error: partyError } = await supabaseAdmin
      .from("parties")
      .select("*")
      .eq("name", party_name)
      .single();

    if (partyError) {
      log.error(`Error gettting party ID: `, partyError);
      throw partyError;
    }
    return { party };
  } catch (error) {
    log.error("Supabase error fetching Parties:", error);
    throw new Error("Error: " + error);
  }
}
