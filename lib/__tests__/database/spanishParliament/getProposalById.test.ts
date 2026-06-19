import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('tslog', () => ({
  Logger: class {
    error = vi.fn();
  },
}));

const { mockSingleProposal, mockEqPromises, mockFrom } = vi.hoisted(() => {
  const mockSingleProposal = vi.fn();
  const mockEqProposal = vi.fn(() => ({ single: mockSingleProposal }));
  const mockSelectProposal = vi.fn(() => ({ eq: mockEqProposal }));

  const mockEqPromises = vi.fn();
  const mockSelectPromises = vi.fn(() => ({ eq: mockEqPromises }));

  const mockFrom = vi.fn((table: string) => {
    if (table === 'proposals') return { select: mockSelectProposal };
    if (table === 'promise_status') return { select: mockSelectPromises };
    return { select: vi.fn() };
  });

  return { mockSingleProposal, mockEqPromises, mockFrom };
});

vi.mock('@/lib/supabaseClient', () => ({
  supabaseAdmin: { from: mockFrom },
}));

import { getProposalById } from '@/lib/database/spanishParliament/getProposalById';

describe('getProposalById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEqPromises.mockResolvedValue({ data: [], error: null });
  });

  it('should return a proposal with relatedPromises on success', async () => {
    const proposal = { id: 1, title: 'Test Proposal', votes_parties_json: null };
    mockSingleProposal.mockResolvedValue({ data: proposal, error: null });
    mockEqPromises.mockResolvedValue({ data: [{ promise_id: 10 }], error: null });

    const result = await getProposalById(1);

    expect(result?.id).toBe(1);
    expect(result?.relatedPromises).toHaveLength(1);
  });

  it('should unwrap votes_parties_json.votes when present', async () => {
    const votes = [{ party: 'PP', for: 10 }];
    const proposal = { id: 2, votes_parties_json: { votes } };
    mockSingleProposal.mockResolvedValue({ data: proposal, error: null });

    const result = await getProposalById(2);

    expect(result?.votes_parties_json).toEqual(votes);
  });

  it('should return undefined when supabase returns an error', async () => {
    mockSingleProposal.mockResolvedValue({ data: null, error: new Error('Not found') });

    const result = await getProposalById(999);

    expect(result).toBeUndefined();
  });

  it('should include empty relatedPromises when promise_status query fails', async () => {
    const proposal = { id: 3, votes_parties_json: null };
    mockSingleProposal.mockResolvedValue({ data: proposal, error: null });
    mockEqPromises.mockResolvedValue({ data: null, error: new Error('join error') });

    const result = await getProposalById(3);

    expect(result?.relatedPromises).toEqual([]);
  });
});
