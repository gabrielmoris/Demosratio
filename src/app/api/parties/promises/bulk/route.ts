import { NextRequest, NextResponse } from 'next/server';
import { Logger } from 'tslog';
import { isAuthorized } from '@/src/middleware/isAuthorized';
import { NewPromise, savePartyPromises } from '@/lib/database/parties/promises/savePartyPromises';

const log = new Logger();

const isValidPromise = (p: NewPromise) =>
  Number.isInteger(p?.subject_id) && typeof p?.promise === 'string' && p.promise.trim().length > 0;

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { party_id, campaign_id, promises } = await req.json();

  if (
    !party_id ||
    !campaign_id ||
    !Array.isArray(promises) ||
    promises.length === 0 ||
    !promises.every(isValidPromise)
  ) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  try {
    const cleaned = promises.map((p: NewPromise) => ({
      subject_id: p.subject_id,
      promise: p.promise.trim(),
    }));
    const saved = await savePartyPromises(party_id, campaign_id, cleaned);
    return NextResponse.json({ count: saved.length }, { status: 201 });
  } catch (error) {
    log.error('Error saving promises:', error);
    return NextResponse.json(
      { success: false, error: 'Saving Promises data failed' },
      { status: 500 }
    );
  }
}
