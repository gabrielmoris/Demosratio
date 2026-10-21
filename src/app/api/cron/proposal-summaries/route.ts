import { NextRequest, NextResponse } from 'next/server';
import { Logger } from 'tslog';

import { isAuthorized } from '@/src/middleware/isAuthorized';
import { buildProposalSummary } from '@/lib/services/proposalSummary';
import { getProposalsMissingSummary, saveProposalSummary } from '@/lib/database/spanishParliament/proposalSummary';
import { ProposalSummaryStatus } from '@/types/proposal.types';

const log = new Logger();

// Each summary means a Congreso search plus Gemini reading a PDF (often 30-100s). Needs Fluid compute.
export const maxDuration = 300;

const DEFAULT_LIMIT = 8;
// Don't start another vote after this. One vote takes at most GEMINI_DEADLINE_MS (150s) plus the
// Congreso lookup, so starting before 130s keeps the run under maxDuration (300s).
const TIME_BUDGET_MS = 130_000;
const MAX_LIMIT = 20;

/**
 * Writes plain-language summaries for votes that don't have one yet, newest first.
 * Runs daily after /api/cron/parliament-data. Also used to fill in older votes:
 * call it again (optionally with ?limit=20) until "processed" is 0.
 */
export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requested = Number(req.nextUrl.searchParams.get('limit'));
  const envLimit = Number(process.env.SUMMARIES_PER_RUN);
  const limit = Math.min(MAX_LIMIT, requested > 0 ? requested : envLimit > 0 ? envLimit : DEFAULT_LIMIT);

  const startedAt = Date.now();

  try {
    const proposals = await getProposalsMissingSummary(limit);
    const counts: Partial<Record<ProposalSummaryStatus, number>> = {};
    let processed = 0;

    for (const proposal of proposals) {
      if (Date.now() - startedAt > TIME_BUDGET_MS) {
        log.info(`Time budget reached after ${processed} votes; the rest go to the next run`);
        break;
      }
      const update = await buildProposalSummary(proposal);
      await saveProposalSummary(proposal.id, update);
      counts[update.plain_summary_status] = (counts[update.plain_summary_status] ?? 0) + 1;
      processed++;
      log.info(`Proposal ${proposal.id}: ${update.plain_summary_status}`, update.initiative_id ?? '');
    }

    return NextResponse.json({ success: true, processed, counts });
  } catch (error) {
    log.error('Error generating proposal summaries:', error);
    return NextResponse.json({ success: false, message: 'Proposal summaries failed' }, { status: 500 });
  }
}
