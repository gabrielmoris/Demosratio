import { verifyJWT } from '@/lib/helpers/users/jwt';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { UserPayload } from '@/types/user';

/**
 * Extracts and verifies the authenticated user from the session JWT cookie.
 * Returns the user payload if valid, or a NextResponse error if not.
 *
 * I use this for all user-level authenticated endpoints (likes, readiness, etc.).
 * For admin-only endpoints, use isAuthorized() instead.
 */
export async function requireAuth(): Promise<
  { user: UserPayload & { user_id: number } } | NextResponse
> {
  const session = (await cookies()).get('session')?.value;

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyJWT(session);

  if (!payload?.id) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  return {
    user: {
      ...payload,
      user_id: Number(payload.id),
    },
  };
}
