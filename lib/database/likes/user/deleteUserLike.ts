import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function deleteUserLike(proposal_id: number, user_id: number) {
  try {
    const { error: dislikedDeleteError } = await supabaseAdmin
      .from("proposal_likes")
      .delete()
      .eq("user_id", user_id)
      .eq("proposal_id", proposal_id)
      .select("id")
      .single();

    if (dislikedDeleteError) {
      throw new Error("Error deleting user dislike");
    }
  } catch (e) {
    log.error(e);
    throw new Error("Error: " + e);
  }
}
