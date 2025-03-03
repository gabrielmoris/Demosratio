import { Pool } from "pg";
import { Logger } from "tslog";
import { User } from "../../types/user.types";

const log = new Logger();

export async function findUser(pool: Pool, email: User["email"]) {
  // get* from users where user = email
}
