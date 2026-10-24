import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/src/middleware/isAuthorized', () => ({ isAuthorized: vi.fn() }));
vi.mock('@/lib/database/legislaturas/getLegislaturas', () => ({
  fetchCurrentLegislaturaId: vi.fn(),
}));
vi.mock('@/lib/database/spanishParliament/pendingPromiseAnalysis', () => ({
  getProposalsPendingAnalysis: vi.fn(),
  countProposalsPendingAnalysis: vi.fn(),
  markPromiseAnalysisDone: vi.fn(),
}));
vi.mock('@/lib/database/parties/promises/promises-analysis/setPromisesAnalysis', () => ({
  setPromiseAnalysis: vi.fn(),
}));
vi.mock('@/lib/services/ai/promisesAnaliseAI', async () => {
  class NoPromisesToAnalyseError extends Error {}
  return { aiPromiseAnalizer: vi.fn(), NoPromisesToAnalyseError };
});
vi.mock('tslog', () => ({
  Logger: class {
    error = vi.fn();
    info = vi.fn();
  },
}));

import { isAuthorized } from '@/src/middleware/isAuthorized';
import { fetchCurrentLegislaturaId } from '@/lib/database/legislaturas/getLegislaturas';
import {
  countProposalsPendingAnalysis,
  getProposalsPendingAnalysis,
  markPromiseAnalysisDone,
} from '@/lib/database/spanishParliament/pendingPromiseAnalysis';
import { setPromiseAnalysis } from '@/lib/database/parties/promises/promises-analysis/setPromisesAnalysis';
import { aiPromiseAnalizer, NoPromisesToAnalyseError } from '@/lib/services/ai/promisesAnaliseAI';
import { GET } from '@/src/app/api/cron/promise-analysis/route';
import { NextRequest } from 'next/server';

const request = (query = '') => new NextRequest(`http://localhost/api/cron/promise-analysis${query}`);
const pending = (id: number) => ({ id, title: `Vote ${id}`, legislatura_id: 16 }) as never;

describe('GET /api/cron/promise-analysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isAuthorized).mockResolvedValue(true);
    vi.mocked(fetchCurrentLegislaturaId).mockResolvedValue(16);
    vi.mocked(countProposalsPendingAnalysis).mockResolvedValue(0);
    vi.mocked(setPromiseAnalysis).mockResolvedValue([1]);
  });

  it('rejects calls without the cron secret or an admin session', async () => {
    vi.mocked(isAuthorized).mockResolvedValue(false);
    expect((await GET(request())).status).toBe(401);
  });

  it('analyses the pending votes of the current legislatura and marks them done', async () => {
    vi.mocked(getProposalsPendingAnalysis).mockResolvedValue([pending(1), pending(2)]);
    vi.mocked(aiPromiseAnalizer).mockResolvedValue([{ party_id: 1 } as never]);

    const res = await GET(request('?limit=7'));
    const body = await res.json();

    expect(getProposalsPendingAnalysis).toHaveBeenCalledWith(16, 7);
    expect(setPromiseAnalysis).toHaveBeenCalledTimes(2);
    expect(markPromiseAnalysisDone).toHaveBeenCalledWith(1);
    expect(markPromiseAnalysisDone).toHaveBeenCalledWith(2);
    expect(body).toMatchObject({ processed: 2, remaining: 0, kind: 'promise-analysis' });
  });

  it('stops without marking anything when the legislatura has no promises yet', async () => {
    vi.mocked(getProposalsPendingAnalysis).mockResolvedValue([pending(1), pending(2)]);
    vi.mocked(aiPromiseAnalizer).mockRejectedValue(new NoPromisesToAnalyseError(16));
    vi.mocked(countProposalsPendingAnalysis).mockResolvedValue(2);

    const body = await (await GET(request())).json();

    expect(aiPromiseAnalizer).toHaveBeenCalledTimes(1);
    expect(markPromiseAnalysisDone).not.toHaveBeenCalled();
    expect(body).toMatchObject({ processed: 0, remaining: 2, stoppedBecause: 'no_promises' });
  });

  it('keeps a vote pending when saving its analyses fails', async () => {
    vi.mocked(getProposalsPendingAnalysis).mockResolvedValue([pending(1)]);
    vi.mocked(aiPromiseAnalizer).mockResolvedValue([{ party_id: 1 } as never]);
    vi.mocked(setPromiseAnalysis).mockResolvedValue({ error: new Error('db') });

    const body = await (await GET(request())).json();

    expect(markPromiseAnalysisDone).not.toHaveBeenCalled();
    expect(body.processed).toBe(0);
  });
});
