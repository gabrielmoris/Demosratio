import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function getuserPromisesReadiness(
  campaign_id: number,
  user_id: number
) {
  try {
    const { data: readiness, error: readinessError } = await supabaseAdmin
      .from("promises_readiness_index")
      .select(`*`)
      .eq("campaign_id", campaign_id)
      .eq("user_id", user_id)
      .single();

    if (readinessError) {
      log.error(`Error gettting promise readiness from user: `, readinessError);
      throw readinessError;
    }

    return { readiness };
  } catch (error) {
    log.error("Supabase error fetching user rate:", error);
    return { error };
  }
}
