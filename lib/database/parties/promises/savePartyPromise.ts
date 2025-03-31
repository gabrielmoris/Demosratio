import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function savePartyPromise(party_id: number, campaign_id: number, subject_id: number, promise: string) {
  try {
    const { data: id, error: insertError } = await supabaseAdmin
      .from("promises")
      .insert([
        {
          promise,
          subject_id,
          party_id,
          campaign_id,
        },
      ])
      .select("id")
      .single();

    if (insertError) {
      log.error(`Error inserting subject:`, insertError);
      throw insertError;
    }

    return { id };
  } catch (error) {
    log.error("Supabase error fetching subjects:", error);
    return { error };
  }
}
