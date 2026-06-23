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
  const mockIlike = vi.fn(() => ({ order: mockOrder1 }));
  const mockSelect = vi.fn(() => ({ ilike: mockIlike }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  return { mockRange, mockFrom };
});

vi.mock('@/lib/supabaseClient', () => ({
  supabaseAdmin: { from: mockFrom },
}));

import { fetchAllLikesAndDislikes } from '@/lib/database/likes/getTotalLikesAndDislikes';
import { getAllProposalsByExpedient } from '@/lib/database/spanishParliament/getAllProposalsByExpedient';

const mockFetch = vi.mocked(fetchAllLikesAndDislikes);

describe('getAllProposalsByExpedient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ result: { likes: 0, dislikes: 0, proposal_id: 1 } });
  });

  it('should return matching proposals and count', async () => {
    const proposals = [{ id: 1, expedient_text: '141/000001' }];
    mockRange.mockResolvedValue({ data: proposals, count: 1, error: null });

    const result = await getAllProposalsByExpedient('141', 1, 10);

    expect(result.proposals).toHaveLength(1);
    expect(result.count).toBe(1);
  });

  it('should attach likesAndDislikes to each proposal', async () => {
    const proposals = [{ id: 7, expedient_text: 'some text' }];
    mockRange.mockResolvedValue({ data: proposals, count: 1, error: null });
    mockFetch.mockResolvedValue({ result: { likes: 2, dislikes: 0, proposal_id: 7 } });

    const result = await getAllProposalsByExpedient('some', 1, 10);

    expect(result.proposals[0].likesAndDislikes).toEqual({ likes: 2, dislikes: 0, proposal_id: 7 });
  });

  it('should throw when supabase returns an error', async () => {
    mockRange.mockResolvedValue({ data: null, count: null, error: new Error('DB error') });

    await expect(getAllProposalsByExpedient('text', 1, 10)).rejects.toThrow();
  });

  it('should use correct pagination range for page 3', async () => {
    mockRange.mockResolvedValue({ data: [], count: 0, error: null });

    await getAllProposalsByExpedient('text', 3, 5);

    expect(mockRange).toHaveBeenCalledWith(10, 14);
  });
});
