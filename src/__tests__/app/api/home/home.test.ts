import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/database/home/getHomeOverview', () => ({
  getHomeOverview: vi.fn(),
}));

vi.mock('@/lib/database/legislaturas/getLegislaturas', () => ({
  resolveLegislaturaId: vi.fn(async (request: Request) => Number(new URL(request.url).searchParams.get('legislatura')) || 15),
}));

vi.mock('tslog', () => ({
  Logger: class {
    error = vi.fn();
  },
}));

import { NextRequest } from 'next/server';
import { GET } from '@/src/app/api/home/route';
import { getHomeOverview } from '@/lib/database/home/getHomeOverview';

const mockGetHomeOverview = vi.mocked(getHomeOverview);

const overview = {
  counters: { totalVotes: 3, analysedVotes: 3, promiseChecks: 12 },
  latestVotes: [],
  period: { from: '2026-09-29', to: '2026-10-28' },
  contradicted: [],
};

describe('GET /api/home', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the overview of the current legislatura by default', async () => {
    mockGetHomeOverview.mockResolvedValue(overview);

    const res = await GET(new NextRequest('http://localhost/api/home'));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(overview);
    expect(mockGetHomeOverview).toHaveBeenCalledWith(15);
  });

  it('uses the requested legislatura', async () => {
    mockGetHomeOverview.mockResolvedValue(overview);

    await GET(new NextRequest('http://localhost/api/home?legislatura=16'));

    expect(mockGetHomeOverview).toHaveBeenCalledWith(16);
  });

  it('returns 500 when the database fails', async () => {
    mockGetHomeOverview.mockRejectedValue(new Error('DB error'));

    const res = await GET(new NextRequest('http://localhost/api/home'));

    expect(res.status).toBe(500);
  });
});
