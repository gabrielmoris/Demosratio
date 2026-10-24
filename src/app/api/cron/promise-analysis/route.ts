import { NextRequest, NextResponse } from 'next/server';
import { Logger } from 'tslog';

import { isAuthorized } from '@/src/middleware/isAuthorized';
import { fetchCurrentLegislaturaId } from '@/lib/database/legislaturas/getLegislaturas';
import {
  countProposalsPendingAnalysis,
  getProposalsPendingAnalysis,
  markPromiseAnalysisDone,
} from '@/lib/database/spanishParliament/pendingPromiseAnalysis';
import { setPromiseAnalysis } from '@/lib/database/parties/promises/promises-analysis/setPromisesAnalysis';
import { aiPromiseAnalizer, NoPromisesToAnalyseError } from '@/lib/services/ai/promisesAnaliseAI';

const log = new Logger();

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;
const TIME_BUDGET_MS = 320_000;

type StopReason = 'time_budget' | 'no_promises' | 'rate_limit';

/**
 * Analyses the votes of the current legislatura that were saved as 'pending': found before the
 * legislatura was made current, or while it had no promises yet. Runs daily after the importer;
 * call it again (optionally with ?limit=20) until "remaining" is 0.
 */
export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requested = Number(req.nextUrl.searchParams.get('limit'));
  const envLimit = Number(process.env.PROMISE_ANALYSES_PER_RUN);
  const limit = Math.min(
    MAX_LIMIT,
    requested > 0 ? requested : envLimit > 0 ? envLimit : DEFAULT_LIMIT
  );

  const startedAt = Date.now();

  try {
    const legislaturaId = await fetchCurrentLegislaturaId();
    const proposals = await getProposalsPendingAnalysis(legislaturaId, limit);

    let processed = 0;
    let stoppedBecause: StopReason | undefined;

    for (const proposal of proposals) {
      if (Date.now() - startedAt > TIME_BUDGET_MS) {
        stoppedBecause = 'time_budget';
        break;
      }

      let analyses: Awaited<ReturnType<typeof aiPromiseAnalizer>>;
      try {
        analyses = await aiPromiseAnalizer(proposal);
      } catch (error) {
        if (error instanceof NoPromisesToAnalyseError) {
          stoppedBecause = 'no_promises';
          break;
        }
        if (error instanceof Error && error.message.includes('Rate limit hit')) {
          stoppedBecause = 'rate_limit';
          break;
        }
        log.error(`Promise analysis failed for proposal ${proposal.id}; retrying next run:`, error);
        continue;
      }

      // setPromiseAnalysis skips analyses that already exist, so a retry never duplicates them
      let saved = true;
      for (const analysis of analyses) {
        const result = await setPromiseAnalysis(analysis, proposal.id);
        if (result && 'error' in result) {
          log.error(`Saving analyses of proposal ${proposal.id} failed; retrying next run:`, result.error);
          saved = false;
          break;
        }
      }
      if (!saved) continue;

      await markPromiseAnalysisDone(proposal.id);
      processed++;
      log.info(`Proposal ${proposal.id}: ${analyses.length} parties with evidence`);
    }

    const remaining = await countProposalsPendingAnalysis(legislaturaId);

    return NextResponse.json({
      success: true,
      kind: 'promise-analysis',
      legislatura_id: legislaturaId,
      processed,
      remaining,
      stoppedBecause,
    });
  } catch (error) {
    log.error('Error analysing pending votes:', error);
    return NextResponse.json(
      { success: false, message: 'Pending promise analysis failed' },
      { status: 500 }
    );
  }
}
