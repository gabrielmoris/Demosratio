import { Pool, QueryResult } from "pg";
import { Logger } from "tslog";
import { User } from "../../types/user.types";

const log = new Logger();

export async function findUser(pool: Pool, email: User["email"]) {
  try {
    const userQuery = `SELECT * FROM users WHERE email = $1`;

    const userResult: QueryResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length > 0) {
      return userResult.rows[0] as User; // Return the first row as a User object
    } else {
      return null; // Return null if no user is found
    }
  } catch (e) {
    log.error(e);
    return null;
  }
}
