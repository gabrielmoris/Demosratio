import { NextRequest, NextResponse } from 'next/server';
import { Logger } from 'tslog';
import { getHomeOverview } from '@/lib/database/home/getHomeOverview';
import { resolveLegislaturaId } from '@/lib/database/legislaturas/getLegislaturas';

const log = new Logger();

/** Counters, latest votes and the promises most contradicted in the last voting week. */
export async function GET(request: NextRequest) {
  try {
    const legislaturaId = await resolveLegislaturaId(request);
    const overview = await getHomeOverview(legislaturaId);
    return NextResponse.json(overview, { status: 200 });
  } catch (error) {
    log.error('Error fetching home overview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
