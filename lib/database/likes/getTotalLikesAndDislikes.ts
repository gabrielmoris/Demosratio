import { Logger } from "tslog";
import { LiKesAndDislikes } from "@/src/types/likesAndDislikes";
import { getLikesCount } from "./likesCount";
import { getDislikesCount } from "./dislikesCount";

const log = new Logger();

export async function fetchAllLikesAndDislikes(proposal_id: number) {
  try {
    const likesCount = await getLikesCount(proposal_id);

    const dislikesCount = await getDislikesCount(proposal_id);

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
