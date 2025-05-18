import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function getPromiseAnalysisByPromise(party_id: number, promise_id: number) {
  if (!party_id || !promise_id) throw new Error("you need to send the args!");

  try {
    const { data: analysis, error: analysisError } = await supabaseAdmin
      .from("promise_status")
      .select(`*`)
      .eq("party_id", party_id)
      .eq("promise_id", promise_id);

    if (analysisError) {
      log.error(`Error gettting promise analysis: `, analysisError);
      throw analysisError;
    }

    return { analysis };
  } catch (error) {
    log.error("Supabase error fetching user rate:", error);
    return { error };
  }
}
