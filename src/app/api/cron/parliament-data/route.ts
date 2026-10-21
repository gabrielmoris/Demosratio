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
import { buildExpedientText, hasSubGroup } from '@/lib/helpers/spanishParliamentExtractor/expedientText';
import { aiPromiseAnalizer } from '@/lib/services/ai/promisesAnaliseAI';
import { setPromiseAnalysis } from '@/lib/database/parties/promises/promises-analysis/setPromisesAnalysis';
import { deleteProposal } from '@/lib/database/spanishParliament/deleteProposal';
import { isAuthorized } from '@/src/middleware/isAuthorized';

const log = new Logger();

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

    for (let i = daysToCheck; i > 0; i--) {
      const dateToCheck = getDateString(i);
      await saveToDb(dateToCheck).catch(e =>
        log.error('Error saving parliamentdata to DB', dateToCheck, '=>', e)
      );
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

async function saveToDb(day: string) {
  // Handles legislature transitions (e.g. XV -> XVI after the Nov 2026 election):
  // if the configured legislature has no votes for this day, it retries with the next one.
  const { legislatura, votations: extractedParliamentData } =
    await extractParliamentDataForDay(day);

  for (const votation of extractedParliamentData) {
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

    try {
      const savedProposal = await saveProposalToDb(proposalData);

      const modelName = process.env.GEMINI_MODEL_ENDPOINT?.split('/models/')[1].split(':')[0];

      if (!savedProposal) {
        throw new Error(`Failed to save proposal: ${title}`);
      }

      // Run AI analysis for new proposals
      const analysisArr = await aiPromiseAnalizer(proposalData);
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
