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

    // If there are no readiness scores, return 0
    if (readinesLength === 0) {
      return { readiness: 0 };
    }

    // Calculate the total readiness score
    const totalReadiness = readiness.reduce(
      (totalScore, currentScore) => totalScore + currentScore.readiness_score,
      0 // Initial value of 0
    );

    return { readiness: Math.round(totalReadiness / readinesLength) };
  } catch (error) {
    log.error("Supabase error fetching subjects:", error);
    return { error };
  }
}
