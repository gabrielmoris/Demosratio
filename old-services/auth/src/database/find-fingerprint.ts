import { Pool, QueryResult } from "pg";
import { Logger } from "tslog";

const log = new Logger();

export async function findFingerprint(pool: Pool, hash: string) {
  try {
    const deviceQery = `SELECT * FROM user_devices WHERE device_hash = $1`;

    const deviceResult: QueryResult = await pool.query(deviceQery, [hash]);

    if (deviceResult.rows.length > 0) {
      return deviceResult.rows[0];
    } else {
      return null;
    }
  } catch (e) {
    log.error(e);
    return null;
  }
}
