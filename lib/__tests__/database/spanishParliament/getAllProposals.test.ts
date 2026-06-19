import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/database/likes/getTotalLikesAndDislikes', () => ({
  fetchAllLikesAndDislikes: vi.fn(),
}));

vi.mock('tslog', () => ({
  Logger: class {
    error = vi.fn();
  },
}));

const { mockRange, mockFrom } = vi.hoisted(() => {
  const mockRange = vi.fn();
  const mockOrder2 = vi.fn(() => ({ range: mockRange }));
  const mockOrder1 = vi.fn(() => ({ order: mockOrder2 }));
  const mockSelect = vi.fn(() => ({ order: mockOrder1 }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  return { mockRange, mockFrom };
});

vi.mock('@/lib/supabaseClient', () => ({
  supabaseAdmin: { from: mockFrom },
}));

import { fetchAllLikesAndDislikes } from '@/lib/database/likes/getTotalLikesAndDislikes';
import { getAllProposals } from '@/lib/database/spanishParliament/getAllProposals';

const mockFetch = vi.mocked(fetchAllLikesAndDislikes);

describe('getAllProposals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ result: { likes: 0, dislikes: 0, proposal_id: 1 } });
  });

  it('should return proposals and count on success', async () => {
    const proposals = [{ id: 1, title: 'Proposal 1' }, { id: 2, title: 'Proposal 2' }];
    mockRange.mockResolvedValue({ data: proposals, count: 2, error: null });

    const result = await getAllProposals(1, 10);

    expect(result.proposals).toHaveLength(2);
    expect(result.count).toBe(2);
  });

  it('should attach likesAndDislikes to each proposal', async () => {
    const proposals = [{ id: 5, title: 'Test' }];
    mockRange.mockResolvedValue({ data: proposals, count: 1, error: null });
    mockFetch.mockResolvedValue({ result: { likes: 3, dislikes: 1, proposal_id: 5 } });

    const result = await getAllProposals(1, 10);

    expect(result.proposals[0].likesAndDislikes).toEqual({ likes: 3, dislikes: 1, proposal_id: 5 });
    expect(mockFetch).toHaveBeenCalledWith(5);
  });

  it('should calculate correct range for page 2', async () => {
    mockRange.mockResolvedValue({ data: [], count: 0, error: null });

    await getAllProposals(2, 5);

    expect(mockRange).toHaveBeenCalledWith(5, 9);
  });

  it('should throw when supabase returns an error', async () => {
    mockRange.mockResolvedValue({ data: null, count: null, error: new Error('DB error') });

    await expect(getAllProposals(1, 10)).rejects.toThrow();
  });
});
