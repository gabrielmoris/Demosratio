import { Logger } from "tslog";
import { LiKesAndDislikes } from "@/src/types/likesAndDislikes";
import { getUserDislikes } from "./user/getUserDislikes";
import { getUserLikes } from "./user/getUserLikes";

const log = new Logger();

export async function fetchUserLikesAndDislikes(
  proposal_id: number,
  userId: number | string
) {
  try {
    // Count likes
    const likesCount = await getUserLikes(proposal_id, Number(userId));

    // Count dislikes
    const dislikesCount = await getUserDislikes(proposal_id, Number(userId));

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
