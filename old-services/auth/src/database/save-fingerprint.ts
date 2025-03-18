import { Pool } from "pg";
import { Logger } from "tslog";

const log = new Logger();

export async function saveFingerprintToDb(pool: Pool, data: { userId: number; hash: string }) {
  try {
    const { hash, userId } = data;

    // First I check if the expedient_text is already saved (It seems they upload a lot of redundant files)
    const checkQuery = `SELECT id FROM user_devices WHERE device_hash = $1`;
    const checkValues = [hash];
    const checkResult = await pool.query(checkQuery, checkValues);

    if (checkResult.rows.length > 0) {
      log.warn(`Device with hash "${hash}" already exists. Skipping.`);
      return null;
    }

    // Then save
    const query = `
        INSERT INTO user_devices (user_id, device_hash)
        VALUES ($1, $2)
        RETURNING id, device_hash;  -- Return the inserted ID if needed
      `;

    const values = [userId, hash];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      log.info(`Hash "${hash}" saved with ID: ${result.rows[0].id}`);
      return result.rows[0];
    } else {
      log.warn(`Hash "${hash}" was not saved.`);
      return null;
    }
  } catch (error) {
    log.error(`Error saving User to database:`, error);
    throw error; // Re-throw the error for handling at a higher level
  }
}
