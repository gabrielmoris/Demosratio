import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findUserByName } from '@/lib/database/users/users';
import { Password } from '@/lib/helpers/users/password';
import { createJWT } from '@/lib/helpers/users/jwt';
import {
 calculateSimilarity,
 findFingerprintsForUser,
 findSimilarFingerprint,
 saveFingerprint,
} from '@/lib/database/users/fingerprint';
import { Logger } from 'tslog';
import { SIMILARITY_THRESHOLD } from '@/constants';

const log = new Logger();

const NAME_MAX_LENGTH = 50;
const NAME_REGEX = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ_.-]+$/;

function sanitizeName(name: string): string | null {
 const trimmed = name.trim();
 if (trimmed.length < 3 || trimmed.length > NAME_MAX_LENGTH) return null;
 if (!NAME_REGEX.test(trimmed)) return null;
 return trimmed;
}

export async function POST(req: NextRequest) {
 try {
 const body = await req.json();
 const { name: rawName, password, fingerprint } = body;

 const name = sanitizeName(rawName ?? '');
 if (!name) {
 return NextResponse.json({ error: 'Name must be valid' }, { status: 400 });
 }

 if (!password || typeof password !== 'string' || password.length > 128) {
 return NextResponse.json({ error: 'You must apply a valid password' }, { status: 400 });
 }

 const existingUser = await findUserByName(name);
 if (!existingUser) {
 return NextResponse.json({ error: 'Invalid Credentials' }, { status: 401 });
 }

 const passwordsMatch = await Password.compare(existingUser.password, password);
 if (!passwordsMatch) {
 return NextResponse.json({ error: 'Invalid Credentials' }, { status: 401 });
 }

 const fingerprintsFromUser = await findFingerprintsForUser(existingUser.id);
 let matchFound = false;

 for (const storedFingerprint of fingerprintsFromUser) {
 const similarity = await calculateSimilarity(fingerprint, storedFingerprint.device_hash);
 if (similarity >= SIMILARITY_THRESHOLD) {
 matchFound = true;
 break;
 }
 }

 if (!matchFound) {
 const existingFingerprint = await findSimilarFingerprint(fingerprint, SIMILARITY_THRESHOLD);
 if (existingFingerprint) {
 return NextResponse.json(
 { error: 'Este dispositivo no está vinculado a tu usuario.' },
 { status: 401 }
 );
 } else {
 const fingerprintToSave = {
 userId: existingUser.id,
 hash: fingerprint,
 };
 await saveFingerprint(fingerprintToSave);
 }
 }

 const userJwt = createJWT({
 id: existingUser.id,
 name: existingUser.name,
 });

 // Align cookie expiry with JWT expiry (24h) plus a small buffer
 const cookieExpiryDate = new Date();
 cookieExpiryDate.setHours(cookieExpiryDate.getHours() + 25);

 (await cookies()).set('session', userJwt, {
 httpOnly: true,
 secure: true,
 sameSite: 'lax',
 path: '/',
 expires: cookieExpiryDate,
 });

 return NextResponse.json(existingUser, { status: 200 });
 } catch (e) {
 log.error(e);
 return NextResponse.json({ error: 'Invalid Credentials' }, { status: 500 });
 }
}
