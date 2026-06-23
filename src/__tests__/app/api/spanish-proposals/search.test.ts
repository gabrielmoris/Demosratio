import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/database/spanishParliament/getAllProposalsByExpedient', () => ({
  getAllProposalsByExpedient: vi.fn(),
}));

vi.mock('tslog', () => ({
  Logger: class {
    error = vi.fn();
  },
}));

import { getAllProposalsByExpedient } from '@/lib/database/spanishParliament/getAllProposalsByExpedient';
import { GET } from '@/src/app/api/spanish-proposals/search/route';
import { NextRequest } from 'next/server';

const mockSearch = vi.mocked(getAllProposalsByExpedient);

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/spanish-proposals/search');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

describe('GET /api/spanish-proposals/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 when expedient_text is missing', async () => {
    const res = await GET(makeRequest({ page: '1', pageSize: '10' }));
    expect(res.status).toBe(400);
  });

  it('should return 400 when page is less than 1', async () => {
    const res = await GET(makeRequest({ expedient_text: 'test', page: '0', pageSize: '10' }));
    expect(res.status).toBe(400);
  });

  it('should return proposals matching the search term', async () => {
    const proposals = [{ id: 1, expedient_text: '141/000001' }];
    mockSearch.mockResolvedValue({ proposals, count: 1 });

    const res = await GET(makeRequest({ expedient_text: '141', page: '1', pageSize: '10' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.proposals).toHaveLength(1);
    expect(body.pagination.totalCount).toBe(1);
  });

  it('should pass expedient_text and pagination to the database function', async () => {
    mockSearch.mockResolvedValue({ proposals: [], count: 0 });

    await GET(makeRequest({ expedient_text: 'sanidad', page: '2', pageSize: '5' }));

    expect(mockSearch).toHaveBeenCalledWith('sanidad', 2, 5);
  });

  it('should return 500 when database throws', async () => {
    mockSearch.mockRejectedValue(new Error('DB error'));

    const res = await GET(makeRequest({ expedient_text: 'test', page: '1', pageSize: '10' }));
    expect(res.status).toBe(500);
  });
});
