import { Pool } from "pg";
import { Logger } from "tslog";

const log = new Logger();

interface liKesAndDislikes {
  likes: number;
  dislikes: number;
  proposal_id: number;
}

export const getLikeandDislikeByUserId = async (
  pool: Pool,
  proposal_id: number,
  user_id: number
): Promise<liKesAndDislikes> => {
  try {
    // Query likes
    const likesCountQuery = `
      SELECT COUNT(*) FROM proposal_likes WHERE proposal_id = $1 AND user_id = $2 
    `;
    const likeValuesQuery = [proposal_id, user_id];
    const checkLikesResult = await pool.query(likesCountQuery, likeValuesQuery);
    const likesCount = parseInt(checkLikesResult.rows[0].count, 10);

    // Quety dislikes
    const dislikesCountQuery = `
    SELECT COUNT(*) FROM proposal_dislikes WHERE proposal_id = $1 AND user_id = $2
  `;
    const dislikeValuesQuery = [proposal_id, user_id];
    const checkDislikesResult = await pool.query(
      dislikesCountQuery,
      dislikeValuesQuery
    );
    const dislikesCount = parseInt(checkDislikesResult.rows[0].count, 10);

    return {
      likes: likesCount || 0,
      dislikes: dislikesCount || 0,
      proposal_id,
    };
  } catch (error) {
    log.error(`Error fetching proposals from database:`, error);
    throw error;
  }
};
