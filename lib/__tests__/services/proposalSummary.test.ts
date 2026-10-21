import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('tslog', () => ({
  Logger: class {
    error = vi.fn();
    info = vi.fn();
  },
}));
vi.mock('@/lib/helpers/spanishParliamentExtractor/initiativeLookup', () => ({ lookupInitiative: vi.fn() }));
vi.mock('@/lib/services/ai/proposalSummaryAI', () => ({ summarizeProposalFromPdf: vi.fn() }));

import { buildProposalSummary } from '@/lib/services/proposalSummary';
import { lookupInitiative } from '@/lib/helpers/spanishParliamentExtractor/initiativeLookup';
import { summarizeProposalFromPdf } from '@/lib/services/ai/proposalSummaryAI';

const lookup = vi.mocked(lookupInitiative);
const summarize = vi.mocked(summarizeProposalFromPdf);

const proposal = { id: 7, title: 'Proposiciones no de Ley.', url: 'https://x?targetLegislatura=XV', expedient_text: 'Proposición no de Ley ...' };
const initiative = { id: '162/000769', title: 'Proposición no de Ley para ...' };
const pdfUrl = 'https://www.congreso.es/public_oficiales/L15/CONG/BOCG/D/BOCG-15-D-518-C1.PDF#page=28';
const es = { summary: 's', yes_means: 'y', no_means: 'n' };

describe('buildProposalSummary', () => {
  beforeEach(() => vi.clearAllMocks());

  it('saves the summary with its source', async () => {
    lookup.mockResolvedValueOnce({ status: 'found', initiative, pdfUrl });
    summarize.mockResolvedValueOnce({ found: true, summary: { es } });

    expect(await buildProposalSummary(proposal)).toEqual({
      plain_summary_status: 'done',
      initiative_id: '162/000769',
      initiative_pdf_url: pdfUrl,
      plain_summary: { es },
    });
    expect(summarize).toHaveBeenCalledWith(expect.objectContaining({ initiativeId: '162/000769', voteTitle: 'Proposiciones no de Ley.' }));
  });

  it('stores lookup outcomes without calling Gemini', async () => {
    lookup.mockResolvedValueOnce({ status: 'not_applicable' });
    expect(await buildProposalSummary(proposal)).toEqual({ plain_summary_status: 'not_applicable' });

    lookup.mockResolvedValueOnce({ status: 'no_pdf', initiative });
    expect(await buildProposalSummary(proposal)).toEqual({ plain_summary_status: 'no_pdf', initiative_id: '162/000769' });

    expect(summarize).not.toHaveBeenCalled();
  });

  it('keeps the source link when Gemini cannot find the initiative in the PDF', async () => {
    lookup.mockResolvedValueOnce({ status: 'found', initiative, pdfUrl });
    summarize.mockResolvedValueOnce({ found: false });
    expect(await buildProposalSummary(proposal)).toEqual({
      plain_summary_status: 'not_in_pdf',
      initiative_id: '162/000769',
      initiative_pdf_url: pdfUrl,
    });
  });

  it('turns failures into status "error" so they are retried', async () => {
    lookup.mockRejectedValueOnce(new Error('Congreso down'));
    expect(await buildProposalSummary(proposal)).toEqual({ plain_summary_status: 'error' });
  });
});
