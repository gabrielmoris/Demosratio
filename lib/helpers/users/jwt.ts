import { UserPayload } from "@/src/types/user";
import jwt from "jsonwebtoken";

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
    console.log(err);
    return null;
  }
};
