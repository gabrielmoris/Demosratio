import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('tslog', () => ({
  Logger: class {
    error = vi.fn();
  },
}));

const { mockMaybeSingle, mockFrom } = vi.hoisted(() => {
  const mockMaybeSingle = vi.fn();
  const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  return { mockMaybeSingle, mockFrom };
});

vi.mock('@/lib/supabaseClient', () => ({ supabaseAdmin: { from: mockFrom } }));

import {
  fetchCurrentLegislaturaId,
  resolveLegislaturaId,
} from '@/lib/database/legislaturas/getLegislaturas';

describe('fetchCurrentLegislaturaId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.TARGET_LEGISLATURA;
  });

  it('returns the current legislatura from the database', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: 16 }, error: null });
    expect(await fetchCurrentLegislaturaId()).toBe(16);
    expect(mockFrom).toHaveBeenCalledWith('legislaturas');
  });

  it('falls back to TARGET_LEGISLATURA, then XV', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await fetchCurrentLegislaturaId()).toBe(15);

    process.env.TARGET_LEGISLATURA = 'XVI';
    mockMaybeSingle.mockResolvedValue({ data: null, error: new Error('no table') });
    expect(await fetchCurrentLegislaturaId()).toBe(16);
  });
});

describe('resolveLegislaturaId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMaybeSingle.mockResolvedValue({ data: { id: 15 }, error: null });
  });

  it('uses ?legislatura= (number or Roman numeral) without asking the database', async () => {
    expect(await resolveLegislaturaId(new Request('http://localhost/api/x?legislatura=16'))).toBe(16);
    expect(await resolveLegislaturaId(new Request('http://localhost/api/x?legislatura=XIV'))).toBe(14);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('uses the current legislatura when the param is missing or invalid', async () => {
    expect(await resolveLegislaturaId(new Request('http://localhost/api/x'))).toBe(15);
    expect(await resolveLegislaturaId(new Request('http://localhost/api/x?legislatura=foo'))).toBe(15);
  });
});
