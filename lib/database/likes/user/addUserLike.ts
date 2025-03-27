import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function addUserLike(proposal_id: number, user_id: number) {
  try {
    const { error: likedAddedError } = await supabaseAdmin
      .from("proposal_likes")
      .insert([
        {
          user_id,
          proposal_id,
        },
      ])
      .select("id")
      .single();

    if (likedAddedError) {
      throw new Error("Error adding likes");
    }
  } catch (e) {
    log.error(e);
    throw new Error("Error: " + e);
  }
}
