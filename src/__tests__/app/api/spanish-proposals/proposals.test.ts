import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/database/spanishParliament/getAllProposals', () => ({
  getAllProposals: vi.fn(),
}));

vi.mock('tslog', () => ({
  Logger: class {
    error = vi.fn();
  },
}));

import { getAllProposals } from '@/lib/database/spanishParliament/getAllProposals';
import { GET } from '@/src/app/api/spanish-proposals/route';
import { NextRequest } from 'next/server';

const mockGetAllProposals = vi.mocked(getAllProposals);

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/spanish-proposals');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

describe('GET /api/spanish-proposals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return proposals with pagination info', async () => {
    const proposals = [{ id: 1, title: 'P1' }, { id: 2, title: 'P2' }];
    mockGetAllProposals.mockResolvedValue({ proposals, count: 2 });

    const res = await GET(makeRequest({ page: '1', pageSize: '10' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.proposals).toHaveLength(2);
    expect(body.pagination.totalCount).toBe(2);
    expect(body.pagination.totalPages).toBe(1);
  });

  it('should use default page=1 and pageSize=10 when params are absent', async () => {
    mockGetAllProposals.mockResolvedValue({ proposals: [], count: 0 });

    await GET(makeRequest());

    expect(mockGetAllProposals).toHaveBeenCalledWith(1, 10);
  });

  it('should return 400 for invalid page parameter', async () => {
    const res = await GET(makeRequest({ page: '0', pageSize: '10' }));

    expect(res.status).toBe(400);
  });

  it('should return 400 for non-numeric page parameter', async () => {
    const res = await GET(makeRequest({ page: 'abc' }));

    expect(res.status).toBe(400);
  });

  it('should return 500 when database throws', async () => {
    mockGetAllProposals.mockRejectedValue(new Error('DB error'));

    const res = await GET(makeRequest());

    expect(res.status).toBe(500);
  });
});
