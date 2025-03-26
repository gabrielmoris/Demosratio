import { Logger } from "tslog";

import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function fetchAllParties() {
  try {
    // Count likes
    const { data: parties, error: partiesError } = await supabaseAdmin
      .from("parties")
      .select("*");

    if (partiesError) {
      throw new Error("Error fetching parties");
    }

    return { parties };
  } catch (error) {
    log.error("Supabase error fetching Parties:", error);
    return { error };
  }
}
