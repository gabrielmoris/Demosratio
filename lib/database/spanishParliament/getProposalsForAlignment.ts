import { supabaseAdmin } from "@/lib/supabaseClient";
import { Logger } from "tslog";

const log = new Logger();

/** Votes of one legislatura only: parliamentary groups change from one legislatura to the next. */
export const getProposalsForAlignment = async (legislaturaId: number) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("proposals")
      .select("id, votes_parties_json")
      .eq("legislatura_id", legislaturaId)
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
