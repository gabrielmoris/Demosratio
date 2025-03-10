import { Pool } from "pg";
import { Logger } from "tslog";

const log = new Logger();

interface Likes {
  proposal_id: string;
  user_id: string;
}

export const addLikesToDb = async (pool: Pool, likeData: Likes) => {
  const { proposal_id, user_id } = likeData;

  try {
    // First I check if the Proposal was already liked by the user
    const checkQuery = `SELECT * FROM proposal_likes WHERE user_id = $1 AND proposal_id = $2`;
    const checkValues = [user_id, proposal_id];
    const checkResult = await pool.query(checkQuery, checkValues);

    if (checkResult.rows.length > 0) {
      log.warn(`Proposal with already Liked. Skipping.`);
      return null;
    }

    // Then save
    const query = `
        INSERT INTO proposal_likes (proposal_id, user_id)
        VALUES ($1, $2)
        RETURNING id;  -- Return the inserted ID if needed
      `;

    const values = [proposal_id, user_id];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      log.info(`Proposal "${proposal_id}" liked with ID: ${result.rows[0].id}`);
      return result.rows[0].id; // Return the ID if needed
    } else {
      log.warn(`Proposal "${proposal_id}" was not liked.`);
      return null;
    }
  } catch (error) {
    log.error(`Error fetching proposals from database:`, error);
    throw error;
  }
};
