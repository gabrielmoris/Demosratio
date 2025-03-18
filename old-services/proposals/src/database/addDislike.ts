import { Pool } from "pg";
import { Logger } from "tslog";

const log = new Logger();

interface Dislikes {
  proposal_id: number;
  user_id: number;
}

export const addDislikesToDb = async (pool: Pool, likeData: Dislikes) => {
  const { proposal_id, user_id } = likeData;

  try {
    // First I check if the Proposal was already disliked by the user
    const checkQuery = `SELECT * FROM proposal_dislikes WHERE user_id = $1 AND proposal_id = $2`;
    const checkValues = [user_id, proposal_id];
    const checkResult = await pool.query(checkQuery, checkValues);

    if (checkResult.rows.length > 0) {
      log.warn(`Proposal with already Disliked. Skipping.`);
      return null;
    }

    // Then save
    const query = `
        INSERT INTO proposal_dislikes (proposal_id, user_id)
        VALUES ($1, $2)
        RETURNING id;  -- Return the inserted ID if needed
      `;

    const values = [proposal_id, user_id];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      log.info(
        `Proposal "${proposal_id}" disliked with ID: ${result.rows[0].id}`
      );
      return result.rows[0].id; // Return the ID if needed
    } else {
      log.warn(`Proposal "${proposal_id}" was not disliked.`);
      return null;
    }
  } catch (error) {
    log.error(`Error fetching proposals from database:`, error);
    throw error;
  }
};
