import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/src/middleware/isAuthorized', () => ({ isAuthorized: vi.fn() }));
vi.mock('@/lib/helpers/spanishParliamentExtractor/getParliamentData', () => ({
  extractParliamentDataForDay: vi.fn(),
  buildVotacionesUrl: (legislatura: string, date: string) => `https://congreso/${legislatura}/${date}`,
}));
vi.mock('@/lib/database/legislaturas/getLegislaturas', () => ({
  fetchCurrentLegislaturaId: vi.fn(),
}));
vi.mock('@/lib/database/legislaturas/manageLegislaturas', () => ({
  ensureLegislaturaExists: vi.fn(),
}));
vi.mock('@/lib/database/spanishParliament/saveProposal', () => ({
  saveProposalToDb: vi.fn(),
  checkProposalExists: vi.fn(),
  checkLegacySubGroupProposalExists: vi.fn(),
}));
vi.mock('@/lib/database/parties/promises/promises-analysis/setPromisesAnalysis', () => ({
  setPromiseAnalysis: vi.fn(),
}));
vi.mock('@/lib/database/spanishParliament/deleteProposal', () => ({ deleteProposal: vi.fn() }));
vi.mock('@/lib/services/geminiClient', () => ({ getPromiseAnalysisEndpoint: () => '' }));
vi.mock('@/lib/services/ai/promisesAnaliseAI', async () => {
  class NoPromisesToAnalyseError extends Error {}
  return { aiPromiseAnalizer: vi.fn(), NoPromisesToAnalyseError };
});
vi.mock('tslog', () => ({
  Logger: class {
    error = vi.fn();
    warn = vi.fn();
    info = vi.fn();
  },
}));

import { isAuthorized } from '@/src/middleware/isAuthorized';
import { extractParliamentDataForDay } from '@/lib/helpers/spanishParliamentExtractor/getParliamentData';
import { fetchCurrentLegislaturaId } from '@/lib/database/legislaturas/getLegislaturas';
import { ensureLegislaturaExists } from '@/lib/database/legislaturas/manageLegislaturas';
import { checkProposalExists, saveProposalToDb } from '@/lib/database/spanishParliament/saveProposal';
import { aiPromiseAnalizer, NoPromisesToAnalyseError } from '@/lib/services/ai/promisesAnaliseAI';
import { GET } from '@/src/app/api/cron/parliament-data/route';
import { NextRequest } from 'next/server';

const votation = {
  informacion: {
    sesion: '1',
    fecha: '10/12/2026',
    titulo: 'Moción',
    textoExpediente: '173/000001',
  },
  totales: {
    presentes: 350,
    afavor: 200,
    enContra: 150,
    abstenciones: 0,
    noVotan: 0,
    asentimiento: 'No',
  },
  votaciones: [{ grupo: 'GS', voto: 'Sí' }],
};

const run = () => GET(new NextRequest('http://localhost/api/cron/parliament-data'));

describe('GET /api/cron/parliament-data and legislaturas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DAYS_TO_CHECK_VOTATIONS = '1';
    vi.mocked(isAuthorized).mockResolvedValue(true);
    vi.mocked(checkProposalExists).mockResolvedValue(null);
    vi.mocked(saveProposalToDb).mockResolvedValue({ id: 1, alreadySavedBefore: false });
    vi.mocked(aiPromiseAnalizer).mockResolvedValue([]);
  });

  it('scrapes the current legislatura and analyses its votes', async () => {
    vi.mocked(fetchCurrentLegislaturaId).mockResolvedValue(15);
    vi.mocked(extractParliamentDataForDay).mockResolvedValue({
      legislatura: 'XV',
      votations: [votation as never],
    });

    await run();

    expect(extractParliamentDataForDay).toHaveBeenCalledWith(expect.any(String), 'XV');
    expect(aiPromiseAnalizer).toHaveBeenCalledTimes(1);
    expect(saveProposalToDb).toHaveBeenCalledWith(
      expect.objectContaining({ legislatura_id: 15, promise_analysis_status: 'done' })
    );
    expect(ensureLegislaturaExists).not.toHaveBeenCalled();
  });

  it('saves votes of the next legislatura as pending, without analysing them against old promises', async () => {
    vi.mocked(fetchCurrentLegislaturaId).mockResolvedValue(15);
    vi.mocked(extractParliamentDataForDay).mockResolvedValue({
      legislatura: 'XVI',
      votations: [votation as never],
    });

    await run();

    expect(ensureLegislaturaExists).toHaveBeenCalledWith(16);
    expect(aiPromiseAnalizer).not.toHaveBeenCalled();
    expect(saveProposalToDb).toHaveBeenCalledWith(
      expect.objectContaining({ legislatura_id: 16, promise_analysis_status: 'pending' })
    );
  });

  it('saves the vote as pending when the current legislatura has no promises yet', async () => {
    vi.mocked(fetchCurrentLegislaturaId).mockResolvedValue(16);
    vi.mocked(extractParliamentDataForDay).mockResolvedValue({
      legislatura: 'XVI',
      votations: [votation as never],
    });
    vi.mocked(aiPromiseAnalizer).mockRejectedValue(new NoPromisesToAnalyseError(16));

    await run();

    expect(saveProposalToDb).toHaveBeenCalledWith(
      expect.objectContaining({ legislatura_id: 16, promise_analysis_status: 'pending' })
    );
  });
});
