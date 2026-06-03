import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteUser, findUserByName, saveUser } from '@/lib/database/users/users';
import { Password } from '@/lib/helpers/users/password';
import { createJWT } from '@/lib/helpers/users/jwt';
import { findSimilarFingerprint, saveFingerprint } from '@/lib/database/users/fingerprint';
import { SIMILARITY_THRESHOLD } from '@/constants';

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

    if (!password || typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { error: 'Password must be between 8 and 128 characters' },
        { status: 400 }
      );
    }

    const existingUser = await findUserByName(name);
    if (existingUser) {
      return NextResponse.json({ error: 'No ha sido posible registrarse.' }, { status: 401 });
    }

    const existingFingerprint = await findSimilarFingerprint(fingerprint, SIMILARITY_THRESHOLD);
    if (existingFingerprint) {
      return NextResponse.json(
        { error: 'Este dispositivo ya está vinculado en otro usuario.' },
        { status: 401 }
      );
    }

    const hashedPassword = await Password.toHash(password);
    const userToSave = {
      name,
      password: hashedPassword,
    };

    try {
      const user = await saveUser(userToSave);
      if (!user) {
        return NextResponse.json({ error: 'No ha sido posible registrarse.' }, { status: 500 });
      }

      const fingerprintToSave = {
        userId: user.id,
        hash: fingerprint,
      };
      await saveFingerprint(fingerprintToSave);

      const userJwt = createJWT({
        id: user.id,
        name: user.name,
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

      return NextResponse.json(user, { status: 201 });
    } catch {
      await deleteUser(name);
      return NextResponse.json({ error: 'No ha sido posible registrarse.' }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: 'No ha sido posible registrarse.' }, { status: 500 });
  }
}
