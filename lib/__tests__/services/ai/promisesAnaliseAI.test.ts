import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/database/parties/getAllParties', () => ({ fetchAllParties: vi.fn() }));
vi.mock('@/lib/database/parties/promises/getPartyPromises', () => ({ fetchPartyPromises: vi.fn() }));
vi.mock('@/lib/database/legislaturas/getLegislaturas', () => ({
  fetchCurrentLegislaturaId: vi.fn(),
}));
vi.mock('@/lib/services/geminiClient', () => ({ analyzePromisesWithGemini: vi.fn() }));
vi.mock('tslog', () => ({
  Logger: class {
    error = vi.fn();
    warn = vi.fn();
    info = vi.fn();
  },
}));

import { fetchAllParties } from '@/lib/database/parties/getAllParties';
import { fetchPartyPromises } from '@/lib/database/parties/promises/getPartyPromises';
import { fetchCurrentLegislaturaId } from '@/lib/database/legislaturas/getLegislaturas';
import { analyzePromisesWithGemini } from '@/lib/services/geminiClient';
import { aiPromiseAnalizer, NoPromisesToAnalyseError } from '@/lib/services/ai/promisesAnaliseAI';
import { VotingData } from '@/types/proposal.types';

const vote = { title: 'Ley de vivienda', legislatura_id: 16 } as VotingData;

const campaign = (id: number, party_id: number) => ({
  id,
  party_id,
  year: 2026,
  campaign_pdf_url: `https://example.com/${id}.pdf`,
  legislatura_id: 16,
});

describe('aiPromiseAnalizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(analyzePromisesWithGemini).mockResolvedValue([]);
  });

  it("analyses the vote against the promises of its legislatura's parties", async () => {
    vi.mocked(fetchAllParties).mockResolvedValue({
      parties: [
        { id: 1, name: 'PSOE', campaigns: [campaign(10, 1)] },
        { id: 2, name: 'PP', campaigns: [campaign(11, 2)] },
      ],
    });
    vi.mocked(fetchPartyPromises).mockImplementation(async (party_id: number) => ({
      promises: party_id === 1 ? [{ id: 100, promise: 'Más vivienda' } as never] : [],
    }));

    await aiPromiseAnalizer(vote);

    expect(fetchAllParties).toHaveBeenCalledWith(16);
    expect(fetchPartyPromises).toHaveBeenCalledWith(1, 10);
    const [sentParties] = vi.mocked(analyzePromisesWithGemini).mock.calls[0];
    // PP has no promises in XVI yet, so it is not sent to Gemini
    expect(sentParties).toHaveLength(1);
    expect(sentParties[0]).toMatchObject({ id: 1, campaign_id: 10, campaign_year: 2026 });
  });

  it('uses the current legislatura for votes without one', async () => {
    vi.mocked(fetchCurrentLegislaturaId).mockResolvedValue(15);
    vi.mocked(fetchAllParties).mockResolvedValue({ parties: [] });

    await expect(aiPromiseAnalizer({ title: 'x' } as VotingData)).rejects.toThrow();
    expect(fetchAllParties).toHaveBeenCalledWith(15);
  });

  it('throws NoPromisesToAnalyseError without calling Gemini when no party has promises', async () => {
    vi.mocked(fetchAllParties).mockResolvedValue({ parties: [] });

    await expect(aiPromiseAnalizer(vote)).rejects.toBeInstanceOf(NoPromisesToAnalyseError);
    expect(analyzePromisesWithGemini).not.toHaveBeenCalled();
    // and does not retry
    expect(fetchAllParties).toHaveBeenCalledTimes(1);
  });
});
