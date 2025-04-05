import { Logger } from "tslog";

import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function getPromisesReadiness(campaign_id: number) {
  try {
    const { data: readiness, error: readinessError } = await supabaseAdmin
      .from("promises_readiness_index")
      .select(`*`)
      .eq("campaign_id", campaign_id);

    if (readinessError) {
      log.error(`Error gettting party ID: `, readinessError);
      throw readinessError;
    }

    const readinesLength = readiness.length;
    const totalReadiness = readiness.reduce(
      (totalScore, currentScore) =>
        totalScore.readiness_score + currentScore.readiness_score
    );

    return { readiness: Math.round(totalReadiness / readinesLength) };
  } catch (error) {
    log.error("Supabase error fetching subjects:", error);
    return { error };
  }
}
