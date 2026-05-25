import { findUserByName } from "@/lib/database/users/users";
import { verifyJWT } from "@/lib/helpers/users/jwt";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function isAuthorized(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  const session = (await cookies()).get("session")?.value;
  if (session) {
    const payload = verifyJWT(session);
    if (payload?.name) {
      const user = await findUserByName(payload.name);
      if (user?.is_admin) {
        return true;
      }
    }
  }

  return false;
}
