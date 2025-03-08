import { Pool, QueryResult } from "pg";
import { Logger } from "tslog";
import { User } from "../../types/user.types";

const log = new Logger();

export async function findFingerprint(pool: Pool, hash: string) {
  try {
    const userQuery = `SELECT * FROM user_devices WHERE device_hash = $1`;

    const userResult: QueryResult = await pool.query(userQuery, [hash]);

    if (userResult.rows.length > 0) {
      return userResult.rows[0] as User; // Return the first row as a Hash object
    } else {
      return null; // Return null if no hash is found
    }
  } catch (e) {
    log.error(e);
    return null;
  }
}
