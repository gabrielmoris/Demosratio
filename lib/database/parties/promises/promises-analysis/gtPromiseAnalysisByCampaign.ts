import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function getPromiseAnalysisByCampaign(party_id: number, campaign_year: number) {
  if (!party_id || !campaign_year) throw new Error("you need to send the args!");

  try {
    const { data: analysis, error: analysisError } = await supabaseAdmin
      .from("promise_status")
      .select(`*`)
      .eq("party_id", party_id)
      .eq("campaign_year", campaign_year);

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
