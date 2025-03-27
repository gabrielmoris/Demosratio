import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function getUserDislikes(proposal_id: number, user_id: number) {
  try {
    const { count: dislikesCount, error: dislikesError } = await supabaseAdmin
      .from("proposal_dislikes")
      .select("*", { count: "exact" })
      .eq("proposal_id", proposal_id)
      .eq("user_id", user_id);

    if (dislikesError) {
      log.error("Supabase error fetching likes:", dislikesError);
      throw new Error("Error fetching likes");
    }
    return dislikesCount;
  } catch (e) {
    log.error(e);
    throw new Error("Error: " + e);
  }
}
