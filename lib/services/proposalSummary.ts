import { Logger } from 'tslog';
import { PlainSummary, ProposalSummaryStatus } from '@/types/proposal.types';
import { lookupInitiative } from '@/lib/helpers/spanishParliamentExtractor/initiativeLookup';
import { summarizeProposalFromPdf } from '@/lib/services/ai/proposalSummaryAI';

const log = new Logger();

export interface ProposalToSummarize {
  id: number;
  title: string;
  url: string;
  expedient_text: string;
}

export interface ProposalSummaryUpdate {
  plain_summary_status: ProposalSummaryStatus;
  initiative_id?: string | null;
  initiative_pdf_url?: string | null;
  plain_summary?: PlainSummary | null;
}

/**
 * Finds the vote's initiative on congreso.es, then writes a plain-language summary
 * from its official BOCG PDF. Never throws: failures come back as status "error".
 */
export async function buildProposalSummary(proposal: ProposalToSummarize): Promise<ProposalSummaryUpdate> {
  try {
    const lookup = await lookupInitiative(proposal.expedient_text, proposal.url);

    if (lookup.status === 'not_applicable' || lookup.status === 'no_match') {
      return { plain_summary_status: lookup.status };
    }
    if (lookup.status === 'no_pdf') {
      return { plain_summary_status: 'no_pdf', initiative_id: lookup.initiative.id };
    }

    const base = { initiative_id: lookup.initiative.id, initiative_pdf_url: lookup.pdfUrl };

    const result = await summarizeProposalFromPdf({
      pdfUrl: lookup.pdfUrl,
      initiativeId: lookup.initiative.id,
      initiativeTitle: lookup.initiative.title,
      expedientText: proposal.expedient_text,
      voteTitle: proposal.title,
    });

    if (!result.found) return { ...base, plain_summary_status: 'not_in_pdf' };
    return { ...base, plain_summary_status: 'done', plain_summary: result.summary };
  } catch (error) {
    log.error(`Summary failed for proposal ${proposal.id}:`, error);
    return { plain_summary_status: 'error' };
  }
}
