import { deleteParty } from '@/lib/database/parties/deleteParty';
import { fetchAllParties } from '@/lib/database/parties/getAllParties';
import { saveParty } from '@/lib/database/parties/saveParty';
import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized } from '@/src/middleware/isAuthorized';
import { resolveLegislaturaId } from '@/lib/database/legislaturas/getLegislaturas';
import { Logger } from 'tslog';

const log = new Logger();

const pgCode = (error: unknown) => (error as { code?: string })?.code;

/**
 * Parties of a legislatura (`?legislatura=16`, default: the current one), each with its campaign.
 * `?all=true` returns every party (admin: add an existing party to a legislatura).
 */
export async function GET(request: NextRequest) {
  try {
    const all = new URL(request.url).searchParams.get('all') === 'true';
    const legislaturaId = all ? undefined : await resolveLegislaturaId(request);
    const { parties, error } = await fetchAllParties(legislaturaId);
    if (error) throw error;
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
    if (pgCode(error) === '23505') {
      return NextResponse.json(
        { error: 'A party with this name already exists', code: 'DUPLICATE_PARTY' },
        { status: 409 }
      );
    }
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
    if (pgCode(error) === '23503') {
      return NextResponse.json(
        {
          error: 'This party still has campaigns. Remove it from its legislaturas first.',
          code: 'PARTY_IN_USE',
        },
        { status: 409 }
      );
    }
    log.error('Error deleting party:', error);
    return NextResponse.json(
      { success: false, message: 'Deleting Party data failed' },
      { status: 500 }
    );
  }
}
