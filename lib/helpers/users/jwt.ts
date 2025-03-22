import { UserPayload } from "@/src/types/user";
import jwt from "jsonwebtoken";
import { Logger } from "tslog";

const log = new Logger();

export const createJWT = (user: { id: string; name: string }) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
    },
    process.env.JWT_KEY!
  );
};

export const verifyJWT = (token: string): UserPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_KEY!) as UserPayload;
  } catch (err) {
    log.error(err);
    return null;
  }
};
