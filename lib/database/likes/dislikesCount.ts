import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function getDislikesCount(proposal_id: number) {
  try {
    // Count likes
    const { count: dislikesCount, error: dislikesError } = await supabaseAdmin
      .from("proposal_dislikes")
      .select("*", { count: "exact" })
      .eq("proposal_id", proposal_id);

    if (dislikesError) {
      throw new Error("Error fetching proposal_likes");
    }
    return dislikesCount;
  } catch (e) {
    log.error(e);
    throw new Error("Error: " + e);
  }
}
