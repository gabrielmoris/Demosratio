import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function updatePromisesReadiness(
  campaign_id: number,
  user_id: number,
  readiness_score: number
) {
  try {
    const { data: id, error: insertError } = await supabaseAdmin
      .from("promises_readiness_index")
      .update([
        {
          readiness_score,
        },
      ])
      .eq("user_id", user_id)
      .eq("campaign_id", campaign_id)
      .select("id")
      .single();

    if (insertError) {
      log.error(`Error inserting promise readiness score:`, insertError);
      throw insertError;
    }

    return id;
  } catch (error) {
    log.error("Supabase error fetching promise readiness scores:", error);
    return { error };
  }
}
