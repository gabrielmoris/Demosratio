import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/helpers/users/jwt';
import { Logger } from 'tslog';

const log = new Logger();

export async function POST() {
  try {
    const session = (await cookies()).get('session');

    if (!session?.value) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    const currentUser = verifyJWT(session.value);

    if (!currentUser) {
      // Token is invalid/expired — still clear the cookie for cleanup
      (await cookies()).delete('session');
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    (await cookies()).delete('session');

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    log.error('Error signing out:', error);
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
  }
}
