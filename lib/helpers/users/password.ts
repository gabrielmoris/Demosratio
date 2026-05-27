import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

/**
 * Constant-time buffer comparison to prevent timing attacks.
 * Uses crypto.timingSafeEqual when available, falls back to manual implementation.
 */
function constantTimeEqual(a: Buffer, b: Buffer): boolean {
 if (a.length !== b.length) return false;

 try {
 return timingSafeEqual(a, b);
 } catch {
 // Fallback for environments where timingSafeEqual may not be available
 let result = 0;
 for (let i = 0; i < a.length; i++) {
 result |= a[i] ^ b[i];
 }
 return result === 0;
 }
}

export class Password {
 static async toHash(password: string) {
 const salt = randomBytes(16).toString("hex");
 const buffer = (await scryptAsync(password, salt, 64)) as Buffer;

 return `${buffer.toString("hex")}.${salt}`;
 }

 static async compare(storedPassword: string, suppliedPassword: string) {
 const [hashedPassword, salt] = storedPassword.split(".");
 const suppliedBuf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
 const storedBuf = Buffer.from(hashedPassword, "hex");

 return constantTimeEqual(storedBuf, suppliedBuf);
 }
}
