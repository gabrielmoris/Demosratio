import { Pool } from "pg";
import { Logger } from "tslog";

const log = new Logger();

interface Likes {
  proposal_id: number;
  user_id: number;
}

export const deleteUserDislike = async (pool: Pool, likeData: Likes) => {
  const { proposal_id, user_id } = likeData;

  try {
    // First I check if the Proposal was already liked by the user
    const checkQuery = `DELETE FROM proposal_dislikes WHERE user_id = $1 AND proposal_id = $2`;
    const checkValues = [user_id, proposal_id];
    const checkResult = await pool.query(checkQuery, checkValues);

    return { proposal_id };
  } catch (error) {
    log.error(`Error fetching proposals from database:`, error);
    throw error;
  }
};
