import { Logger } from "tslog";

import { supabaseAdmin } from "@/lib/supabaseClient";
import { LiKesAndDislikes } from "@/src/types/likesAndDislikes";

const log = new Logger();

export async function fetchUserLikesAndDislikes(
  proposal_id: number,
  userId: number | string
) {
  try {
    // Count likes
    const { count: likesCount, error: likesError } = await supabaseAdmin
      .from("proposal_likes")
      .select("*", { count: "exact" })
      .eq("proposal_id", proposal_id)
      .eq("user_id", userId);

    if (likesError) {
      throw new Error("Error fetching likes");
    }

    // Count dislikes
    const { count: dislikesCount, error: dislikesError } = await supabaseAdmin
      .from("proposal_dislikes")
      .select("*", { count: "exact" })
      .eq("proposal_id", proposal_id)
      .eq("user_id", userId);

    if (dislikesError) {
      throw new Error("Error fetching dislikes");
    }

    const result: LiKesAndDislikes = {
      likes: likesCount || 0, // Handle potential null count
      dislikes: dislikesCount || 0, // Handle potential null count
      proposal_id: Number(proposal_id),
    };

    return { result };
  } catch (error) {
    log.error("Supabase error fetching user likes and dislikes:", error);
    return { error };
  }
}
