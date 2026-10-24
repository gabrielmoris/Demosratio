import { NextRequest, NextResponse } from 'next/server';
import { Logger } from 'tslog';

import { getDateString, getFormattedDateForDB } from '@/lib/helpers/dateFormatters';
import { mergeVotesByParty } from '@/lib/helpers/spanishParliamentExtractor/votesPerParty';
import { VotingData } from '@/types/proposal.types';
import {
  buildVotacionesUrl,
  extractParliamentDataForDay,
} from '@/lib/helpers/spanishParliamentExtractor/getParliamentData';
import {
  saveProposalToDb,
  checkProposalExists,
  checkLegacySubGroupProposalExists,
} from '@/lib/database/spanishParliament/saveProposal';
import {
  buildExpedientText,
  hasSubGroup,
} from '@/lib/helpers/spanishParliamentExtractor/expedientText';
import { aiPromiseAnalizer } from '@/lib/services/ai/promisesAnaliseAI';
import { getPromiseAnalysisEndpoint } from '@/lib/services/geminiClient';
import { getModelName } from '@/lib/services/ai/geminiConfig';
import { setPromiseAnalysis } from '@/lib/database/parties/promises/promises-analysis/setPromisesAnalysis';
import { deleteProposal } from '@/lib/database/spanishParliament/deleteProposal';
import { isAuthorized } from '@/src/middleware/isAuthorized';

const log = new Logger();

const TIME_BUDGET_MS = 320_000;

/** Thrown when the run should end early; votes not processed are picked up by the next run. */
class StopRunError extends Error {}

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  log.info(`
██████╗ ███████╗███╗   ███╗ ██████╗ ███████╗██████╗  █████╗ ████████╗██╗ ██████╗ 
██╔══██╗██╔════╝████╗ ████║██╔═══██╗██╔════╝██╔══██╗██╔══██╗╚══██╔══╝██║██╔═══██╗
██║  ██║█████╗  ██╔████╔██║██║   ██║███████╗██████╔╝███████║   ██║   ██║██║   ██║
██║  ██║██╔══╝  ██║╚██╔╝██║██║   ██║╚════██║██╔══██╗██╔══██║   ██║   ██║██║   ██║
██████╔╝███████╗██║ ╚═╝ ██║╚██████╔╝███████║██║  ██║██║  ██║   ██║   ██║╚██████╔╝
╚═════╝ ╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝
    Running parliament data extractor...`);

  try {
    const daysToCheck = parseInt(process.env.DAYS_TO_CHECK_VOTATIONS || '5', 10);
    const deadline = Date.now() + TIME_BUDGET_MS;

    for (let i = daysToCheck; i > 0; i--) {
      const dateToCheck = getDateString(i);
      try {
        await saveToDb(dateToCheck, deadline);
      } catch (e) {
        if (e instanceof StopRunError) {
          log.warn(`Stopping early: ${e.message}. The next run continues from here.`);
          break;
        }
        log.error('Error saving parliamentdata to DB', dateToCheck, '=>', e);
      }
    }

    log.info('Parliament data extraction completed successfully');
    return NextResponse.json({
      success: true,
      message: 'Parliament data extraction completed',
    });
  } catch (error) {
    log.error('Error in parliament data extraction:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Parliament data extraction failed',
      },
      { status: 500 }
    );
  }
}

async function saveToDb(day: string, deadline: number) {
  // Handles legislature transitions (e.g. XV -> XVI after the Nov 2026 election):
  // if the configured legislature has no votes for this day, it retries with the next one.
  const { legislatura, votations: extractedParliamentData } =
    await extractParliamentDataForDay(day);

  for (const votation of extractedParliamentData) {
    if (Date.now() > deadline) throw new StopRunError('time budget reached');

    const { sesion: session, fecha: date, titulo: title } = votation.informacion;

    const {
      presentes: parliament_presence,
      afavor: votes_for,
      enContra: votes_against,
      abstenciones: abstentions,
      noVotan: no_vote,
      asentimiento: assent,
    } = votation.totales;

    // Points of a motion voted separately share textoExpediente, so the point label is added to it
    const expedient_text = buildExpedientText(votation.informacion);

    const existingProposal =
      (await checkProposalExists(expedient_text)) ??
      (hasSubGroup(votation.informacion)
        ? await checkLegacySubGroupProposalExists(votation.informacion.textoExpediente, {
            session,
            date: getFormattedDateForDB(date),
            votes_for,
            votes_against,
            abstentions,
          })
        : null);

    if (existingProposal) {
      log.warn(`Proposal with expedient_text "${expedient_text}" already exists. Skipping.`);
      continue;
    }

    const votes_parties_json = mergeVotesByParty(votation.votaciones);
    // asentimiento="Sí" means unanimous consent (no formal count); otherwise check afavor > enContra
    const isAccepted = assent === 'Sí' || votes_for > votes_against;

    const proposalData: VotingData = {
      session,
      date: getFormattedDateForDB(date),
      title,
      url: buildVotacionesUrl(legislatura, day),
      expedient_text,
      parliament_presence,
      votes_for,
      votes_against,
      abstentions,
      no_vote,
      votes_parties_json,
      assent: isAccepted,
    };

    // Analyse BEFORE saving: if Gemini fails, nothing is saved and the next run retries this vote.
    // (Saving first left votes without analysis forever, since they then counted as existing.)
    let analysisArr: Awaited<ReturnType<typeof aiPromiseAnalizer>>;
    try {
      analysisArr = await aiPromiseAnalizer(proposalData);
    } catch (error) {
      const rateLimited = error instanceof Error && error.message.includes('Rate limit hit');
      log.error(`Promise analysis failed for ${day} "${title}", not saving it this run:`, error);
      // Gemini is out of quota: the remaining votes would fail the same way
      if (rateLimited) throw new StopRunError('Gemini rate limit');
      throw error;
    }

    try {
      const savedProposal = await saveProposalToDb(proposalData);

      const modelName = getModelName(getPromiseAnalysisEndpoint() ?? '');

      if (!savedProposal) {
        throw new Error(`Failed to save proposal: ${title}`);
      }

      log.info('SAVING ', day, ' ', savedProposal.id);
      log.info(`${modelName} analyse => `, analysisArr.length, analysisArr[0]);

      if (analysisArr.length > 0) {
        for (const analysis of analysisArr) {
          const result = await setPromiseAnalysis(analysis, savedProposal.id);

          if (result && 'error' in result) {
            log.error('Promise analysis failed, deleting proposal:', result.error);

            await deleteProposal(savedProposal.id);

            throw new Error(`Promise analysis failed: ${result.error}`);
          }
        }
      }
    } catch (error) {
      log.error(`Failed to save proposal ${day} "${title}":`, error);
      throw new Error(`Failed to save proposal ${day} "${title}"`);
    }
  }
}
