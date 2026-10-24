import { fetchAllParties } from '@/lib/database/parties/getAllParties';
import { fetchCurrentLegislaturaId } from '@/lib/database/legislaturas/getLegislaturas';
import { analyzePromisesWithGemini } from '@/lib/services/geminiClient';
import { Party, PartyAnalysisOutput, PartyWithPromises } from '@/types/politicalParties';
import { Logger } from 'tslog';
import { fetchPartyPromises } from '../../database/parties/promises/getPartyPromises';
import { VotingData } from '@/types/proposal.types';

const log = new Logger();

/** The vote's legislatura has no party with promises yet: nothing to analyse it against. */
export class NoPromisesToAnalyseError extends Error {
  constructor(public legislaturaId: number) {
    super(`No party has promises in legislatura ${legislaturaId} yet`);
    this.name = 'NoPromisesToAnalyseError';
  }
}

/** Parties of a legislatura with the promises of their campaign in it. Parties without promises are left out. */
export const fetchPartiesToAnalyse = async (legislaturaId: number): Promise<PartyWithPromises[]> => {
  const { parties, error } = await fetchAllParties(legislaturaId);
  if (error || !parties) throw new Error('Error fetching parties');

  const partiesToAnalyse: PartyWithPromises[] = [];

  for (const party of parties as Party[]) {
    const campaign = party.campaigns?.[0];
    if (!campaign) continue;

    const { promises } = await fetchPartyPromises(party.id, campaign.id);
    if (!promises?.length) {
      log.warn(`No promises for ${party.name} in legislatura ${legislaturaId}, skipping it`);
      continue;
    }

    partiesToAnalyse.push({
      id: party.id,
      name: party.name,
      year: party.year,
      abbreviation: party.abbreviation,
      campaign_year: campaign.year,
      campaign_pdf_url: campaign.campaign_pdf_url,
      campaign_id: campaign.id,
      promises,
    });
  }

  return partiesToAnalyse;
};

/**
 * Checks the vote against the promises of the parties of the vote's legislatura
 * (the current one when the vote has no legislatura_id).
 * Throws NoPromisesToAnalyseError when that legislatura has no promises yet.
 */
export const aiPromiseAnalizer = async (
  proposal: VotingData,
  retryCount = 2
): Promise<PartyAnalysisOutput[]> => {
  try {
    if (!proposal) throw new Error('Need to send Propuesta.');

    const legislaturaId = proposal.legislatura_id ?? (await fetchCurrentLegislaturaId());
    const parties = await fetchPartiesToAnalyse(legislaturaId);
    if (parties.length === 0) throw new NoPromisesToAnalyseError(legislaturaId);

    const analysis = await analyzePromisesWithGemini(parties, proposal);

    return analysis;
  } catch (error) {
    if (error instanceof NoPromisesToAnalyseError) throw error;

    log.error('Error analising promises:', error);

    const rateLimited = error instanceof Error && error.message.includes('Rate limit hit');

    const geminiFailed = error instanceof Error && error.message.includes('Gemini API error');
    if (retryCount > 0 && !rateLimited && !geminiFailed) {
      log.info(`Retrying... (${retryCount} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return aiPromiseAnalizer(proposal, retryCount - 1);
    }

    if (rateLimited) throw error;
    throw new Error('Error analising promises after retries.');
  }
};
