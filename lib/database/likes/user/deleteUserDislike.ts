import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function deleteUserDislike(proposal_id: number, user_id: number) {
  try {
    const { error: dislikedDeleteError } = await supabaseAdmin
      .from("proposal_dislikes")
      .delete()
      .eq("user_id", user_id)
      .eq("proposal_id", proposal_id)
      .select("id")
      .single();

    if (dislikedDeleteError) {
      log.error("Supabase error deleting user dlike:", dislikedDeleteError);
      throw new Error("Error deleting user dislike");
    }
  } catch (e) {
    log.error(e);
    throw new Error("Error: " + e);
  }
}
