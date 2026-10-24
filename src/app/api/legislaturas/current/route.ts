import { NextRequest, NextResponse } from 'next/server';
import { Logger } from 'tslog';
import { isAuthorized } from '@/src/middleware/isAuthorized';
import { setCurrentLegislatura } from '@/lib/database/legislaturas/manageLegislaturas';
import { parseLegislatura } from '@/lib/helpers/legislatura';

const log = new Logger();

/**
 * Makes a legislatura the current one: the website shows it by default, the cron scrapes it
 * and /api/cron/promise-analysis starts analysing its pending votes.
 */
export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: rawId } = await req.json();
  const id = parseLegislatura(rawId);
  if (!id) return NextResponse.json({ error: 'Bad Request' }, { status: 400 });

  try {
    await setCurrentLegislatura(id);
    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    if ((error as { code?: string })?.code === 'P0002') {
      return NextResponse.json({ error: 'Legislatura not found' }, { status: 404 });
    }
    log.error('Error setting the current legislatura:', error);
    return NextResponse.json(
      { success: false, message: 'Setting the current legislatura failed' },
      { status: 500 }
    );
  }
}
