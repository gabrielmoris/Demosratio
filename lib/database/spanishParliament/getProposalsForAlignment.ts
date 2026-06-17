import { supabaseAdmin } from "@/lib/supabaseClient";
import { Logger } from "tslog";

const log = new Logger();

export const getProposalsForAlignment = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from("proposals")
      .select("id, votes_parties_json")
      .limit(10000);

    if (error) {
      log.error("Supabase error:", error);
      throw new Error("Error fetching proposals for alignment");
    }

    return data ?? [];
  } catch (e) {
    log.error(e);
    throw new Error(e instanceof Error ? e.message : String(e));
  }
};
