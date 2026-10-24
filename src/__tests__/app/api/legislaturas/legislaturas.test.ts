import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/src/middleware/isAuthorized', () => ({ isAuthorized: vi.fn() }));
vi.mock('@/lib/database/legislaturas/getLegislaturas', () => ({
  fetchLegislaturas: vi.fn(),
  fetchCurrentLegislaturaId: vi.fn(),
}));
vi.mock('@/lib/database/legislaturas/manageLegislaturas', () => ({
  saveLegislatura: vi.fn(),
  updateLegislatura: vi.fn(),
  deleteLegislatura: vi.fn(),
  setCurrentLegislatura: vi.fn(),
}));
vi.mock('tslog', () => ({
  Logger: class {
    error = vi.fn();
  },
}));

import { isAuthorized } from '@/src/middleware/isAuthorized';
import {
  fetchCurrentLegislaturaId,
  fetchLegislaturas,
} from '@/lib/database/legislaturas/getLegislaturas';
import {
  deleteLegislatura,
  saveLegislatura,
  setCurrentLegislatura,
  updateLegislatura,
} from '@/lib/database/legislaturas/manageLegislaturas';
import { DELETE, GET, PATCH, POST } from '@/src/app/api/legislaturas/route';
import { POST as SET_CURRENT } from '@/src/app/api/legislaturas/current/route';
import { NextRequest } from 'next/server';

const makeRequest = (method: string, body: object, path = '/api/legislaturas') =>
  new NextRequest(`http://localhost${path}`, { method, body: JSON.stringify(body) });

describe('/api/legislaturas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isAuthorized).mockResolvedValue(true);
    vi.mocked(fetchCurrentLegislaturaId).mockResolvedValue(15);
  });

  it('GET lists the legislaturas for everyone', async () => {
    const list = [{ id: 16, is_current: false }, { id: 15, is_current: true }];
    vi.mocked(fetchLegislaturas).mockResolvedValue(list as never);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(list);
    expect(isAuthorized).not.toHaveBeenCalled();
  });

  it('POST creates a legislatura, accepting Roman numerals and empty dates', async () => {
    vi.mocked(saveLegislatura).mockResolvedValue({ id: 16 });

    const res = await POST(
      makeRequest('POST', { id: 'XVI', election_date: '2026-11-22', start_date: '', end_date: null })
    );

    expect(res.status).toBe(201);
    expect(saveLegislatura).toHaveBeenCalledWith({
      id: 16,
      election_date: '2026-11-22',
      start_date: null,
      end_date: null,
    });
  });

  it('POST rejects invalid input, non-admins and duplicates', async () => {
    expect((await POST(makeRequest('POST', { id: 0 }))).status).toBe(400);
    expect((await POST(makeRequest('POST', { id: 16, election_date: '22/11/2026' }))).status).toBe(400);
    expect(
      (await POST(makeRequest('POST', { id: 16, start_date: '2026-12-01', end_date: '2026-01-01' })))
        .status
    ).toBe(400);
    expect(saveLegislatura).not.toHaveBeenCalled();

    vi.mocked(saveLegislatura).mockRejectedValue({ code: '23505' });
    const duplicate = await POST(makeRequest('POST', { id: 15 }));
    expect(duplicate.status).toBe(409);
    expect((await duplicate.json()).code).toBe('DUPLICATE_LEGISLATURA');

    vi.mocked(isAuthorized).mockResolvedValue(false);
    expect((await POST(makeRequest('POST', { id: 16 }))).status).toBe(403);
  });

  it('PATCH updates the dates', async () => {
    vi.mocked(updateLegislatura).mockResolvedValue({ id: 15 });

    const res = await PATCH(makeRequest('PATCH', { id: 15, end_date: '2026-09-30' }));

    expect(res.status).toBe(200);
    expect(updateLegislatura).toHaveBeenCalledWith({
      id: 15,
      election_date: null,
      start_date: null,
      end_date: '2026-09-30',
    });
  });

  it('DELETE refuses the current legislatura', async () => {
    const res = await DELETE(makeRequest('DELETE', { id: 15 }));

    expect(res.status).toBe(409);
    expect((await res.json()).code).toBe('LEGISLATURA_IS_CURRENT');
    expect(deleteLegislatura).not.toHaveBeenCalled();
  });

  it('DELETE refuses a legislatura that still has parties or votes', async () => {
    vi.mocked(deleteLegislatura).mockRejectedValue({ code: '23503' });

    const res = await DELETE(makeRequest('DELETE', { id: 16 }));

    expect(res.status).toBe(409);
    expect((await res.json()).code).toBe('LEGISLATURA_IN_USE');
  });

  it('DELETE removes an unused legislatura', async () => {
    vi.mocked(deleteLegislatura).mockResolvedValue({ id: 16 });

    const res = await DELETE(makeRequest('DELETE', { id: 16 }));

    expect(res.status).toBe(200);
    expect(deleteLegislatura).toHaveBeenCalledWith(16);
  });

  it('POST /current makes a legislatura current (admins only)', async () => {
    const res = await SET_CURRENT(makeRequest('POST', { id: 16 }, '/api/legislaturas/current'));
    expect(res.status).toBe(200);
    expect(setCurrentLegislatura).toHaveBeenCalledWith(16);

    vi.mocked(setCurrentLegislatura).mockRejectedValue({ code: 'P0002' });
    expect(
      (await SET_CURRENT(makeRequest('POST', { id: 99 }, '/api/legislaturas/current'))).status
    ).toBe(404);

    vi.mocked(isAuthorized).mockResolvedValue(false);
    expect(
      (await SET_CURRENT(makeRequest('POST', { id: 16 }, '/api/legislaturas/current'))).status
    ).toBe(403);
  });
});
