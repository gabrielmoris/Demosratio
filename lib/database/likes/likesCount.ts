import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function getLikesCount(proposal_id: number) {
  try {
    // Count likes
    const { count: likesCount, error: likesError } = await supabaseAdmin
      .from("proposal_likes")
      .select("*", { count: "exact" })
      .eq("proposal_id", proposal_id);

    if (likesError) {
      throw new Error("Error fetching proposal_likes");
    }
    return likesCount;
  } catch (e) {
    log.error(e);
    throw new Error("Error: " + e);
  }
}
