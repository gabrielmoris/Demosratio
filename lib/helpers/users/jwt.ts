import { UserPayload } from "@/types/user";
import jwt from "jsonwebtoken";
import { Logger } from "tslog";

const log = new Logger();

export const createJWT = (user: { id: string; name: string }) => {
 return jwt.sign(
 {
 id: user.id,
 name: user.name,
 },
 process.env.JWT_KEY!,
 { expiresIn: "24h", algorithm: "HS256" }
 );
};

export const verifyJWT = (token: string): UserPayload | null => {
 try {
 return jwt.verify(token, process.env.JWT_KEY!, {
 algorithms: ["HS256"],
 }) as UserPayload;
 } catch (err) {
 log.error(err);
 return null;
 }
};
