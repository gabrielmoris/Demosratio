import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function addUserDislike(proposal_id: number, user_id: number) {
  try {
    const { error: dislikedAddedError } = await supabaseAdmin
      .from("proposal_dislikes")
      .insert([
        {
          user_id,
          proposal_id,
        },
      ])
      .select("id")
      .single();

    if (dislikedAddedError) {
      throw new Error("Error adding likes");
    }
  } catch (e) {
    log.error(e);
    throw new Error("Error: " + e);
  }
}
