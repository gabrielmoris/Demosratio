import { Logger } from "tslog";

import { supabaseAdmin } from "@/lib/supabaseClient";
import { LiKesAndDislikes } from "@/src/types/likesAndDislikes";

const log = new Logger();

export async function fetchAllLikesAndDislikes(proposal_id: number) {
  try {
    // Count likes
    const { count: likesCount, error: likesError } = await supabaseAdmin
      .from("proposal_likes")
      .select("*", { count: "exact" })
      .eq("proposal_id", proposal_id);

    if (likesError) {
      throw new Error("Error fetching proposal_likes");
    }

    // Count dislikes
    const { count: dislikesCount, error: dislikesError } = await supabaseAdmin
      .from("proposal_dislikes")
      .select("*", { count: "exact" })
      .eq("proposal_id", proposal_id);

    if (dislikesError) {
      throw new Error("Error fetching proposal_dislikes");
    }

    const result: LiKesAndDislikes = {
      likes: likesCount || 0, // Handle potential null count
      dislikes: dislikesCount || 0, // Handle potential null count
      proposal_id: Number(proposal_id),
    };
    return { result };
  } catch (error) {
    log.error("Supabase error fetching likes and dislikes:", error);
    return { error };
  }
}
