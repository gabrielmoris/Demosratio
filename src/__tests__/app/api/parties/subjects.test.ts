import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/src/middleware/isAuthorized', () => ({ isAuthorized: vi.fn() }));
vi.mock('@/lib/database/parties/subjects/updateSubject', () => ({ updateSubject: vi.fn() }));
vi.mock('@/lib/database/parties/subjects/deleteSubject', () => ({ deleteSubject: vi.fn() }));
vi.mock('@/lib/database/parties/subjects/saveSubject', () => ({ saveSubject: vi.fn() }));
vi.mock('@/lib/database/parties/subjects/getAllSubjects', () => ({ fetchAllsubjects: vi.fn() }));
vi.mock('tslog', () => ({
  Logger: class {
    error = vi.fn();
  },
}));

import { isAuthorized } from '@/src/middleware/isAuthorized';
import { updateSubject } from '@/lib/database/parties/subjects/updateSubject';
import { deleteSubject } from '@/lib/database/parties/subjects/deleteSubject';
import { saveSubject } from '@/lib/database/parties/subjects/saveSubject';
import { DELETE, PATCH, POST } from '@/src/app/api/parties/subjects/route';
import { NextRequest } from 'next/server';

const makeRequest = (method: string, body: object) =>
  new NextRequest('http://localhost/api/parties/subjects', { method, body: JSON.stringify(body) });

describe('/api/parties/subjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isAuthorized).mockResolvedValue(true);
  });

  it('PATCH updates a subject with trimmed values', async () => {
    vi.mocked(updateSubject).mockResolvedValue({ id: 3 });
    const res = await PATCH(makeRequest('PATCH', { subject_id: 3, name: ' Vivienda ', description: ' Acceso a la vivienda ' }));
    expect(res.status).toBe(200);
    expect(updateSubject).toHaveBeenCalledWith(3, 'Vivienda', 'Acceso a la vivienda');
  });

  it('PATCH rejects missing fields and non-admins', async () => {
    expect((await PATCH(makeRequest('PATCH', { subject_id: 3, name: ' ', description: 'x' }))).status).toBe(400);
    vi.mocked(isAuthorized).mockResolvedValue(false);
    expect((await PATCH(makeRequest('PATCH', { subject_id: 3, name: 'a', description: 'b' }))).status).toBe(403);
    expect(updateSubject).not.toHaveBeenCalled();
  });

  it('PATCH and POST return DUPLICATE_NAME on unique violations', async () => {
    vi.mocked(updateSubject).mockRejectedValue({ code: '23505' });
    vi.mocked(saveSubject).mockRejectedValue({ code: '23505' });

    const patch = await PATCH(makeRequest('PATCH', { subject_id: 3, name: 'Salud', description: 'x' }));
    const post = await POST(makeRequest('POST', { name: 'Salud', description: 'x' }));

    expect(patch.status).toBe(409);
    expect((await patch.json()).code).toBe('DUPLICATE_NAME');
    expect(post.status).toBe(409);
  });

  it('DELETE returns SUBJECT_IN_USE when promises still reference it', async () => {
    vi.mocked(deleteSubject).mockRejectedValue({ code: '23503' });
    const res = await DELETE(makeRequest('DELETE', { subject_id: 1 }));
    expect(res.status).toBe(409);
    expect((await res.json()).code).toBe('SUBJECT_IN_USE');
  });
});
