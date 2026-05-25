import { deleteParty } from '@/lib/database/parties/deleteParty';
import { fetchAllParties } from '@/lib/database/parties/getAllParties';
import { saveParty } from '@/lib/database/parties/saveParty';
import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized } from '@/src/middleware/isAuthorized';
import { Logger } from 'tslog';

const log = new Logger();

export async function GET() {
  try {
    const { parties } = await fetchAllParties();
    return NextResponse.json(parties);
  } catch (error) {
    log.error('Error fetching parties:', error);
    return NextResponse.json(
      { success: false, message: 'Getting Parties data failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, logo_url } = await req.json();

  if (!name || !logo_url) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  try {
    const { id } = await saveParty(name, logo_url);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    log.error('Error saving party:', error);
    return NextResponse.json(
      { success: false, message: 'Saving Party data failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { party_id } = await req.json();

  if (!party_id) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  try {
    const { id } = await deleteParty(party_id);
    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    log.error('Error deleting party:', error);
    return NextResponse.json(
      { success: false, message: 'Deleting Party data failed' },
      { status: 500 }
    );
  }
}
