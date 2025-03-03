import { Pool } from "pg";
import { Logger } from "tslog";
import { User } from "../../types/user.types";

const log = new Logger();

export async function saveUserToDb(pool: Pool, UserData: User) {
  try {
    const { email, password, hash } = UserData;

    // First I check if the expedient_text is already saved (It seems they upload a lot of redundant files)
    const checkQuery = `SELECT id FROM proposals WHERE email = $1`;
    const checkValues = [email];
    const checkResult = await pool.query(checkQuery, checkValues);

    if (checkResult.rows.length > 0) {
      log.warn(`Proposal with email "${email}" already exists. Skipping.`);
      return null;
    }

    // Then save
    const query = `
        INSERT INTO user (email, password, hash)
        VALUES ($1, $2, $3)
        RETURNING id;  -- Return the inserted ID if needed
      `;

    const values = [email, password, hash || "no validated"];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      log.info(`User "${email}" saved with ID: ${result.rows[0].id}`);
      return result.rows[0].id; // Return the ID if you need it
    } else {
      log.warn(`User "${email}" was not saved.`);
      return null;
    }
  } catch (error) {
    log.error(`Error saving User to database:`, error);
    throw error; // Re-throw the error for handling at a higher level
  }
}
