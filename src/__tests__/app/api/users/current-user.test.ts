import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/lib/helpers/users/jwt', () => ({
  verifyJWT: vi.fn(),
}));

vi.mock('@/lib/database/users/users', () => ({
  findUserByName: vi.fn(),
}));

vi.mock('tslog', () => ({
  Logger: class {
    error = vi.fn();
  },
}));

import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/helpers/users/jwt';
import { findUserByName } from '@/lib/database/users/users';
import { GET } from '@/src/app/api/users/current-user/route';

const mockCookies = vi.mocked(cookies);
const mockVerifyJWT = vi.mocked(verifyJWT);
const mockFindUserByName = vi.mocked(findUserByName);

const mockDelete = vi.fn();

function setupCookies(sessionValue?: string) {
  mockCookies.mockResolvedValue({
    get: vi.fn((key: string) => (key === 'session' && sessionValue ? { value: sessionValue } : undefined)),
    delete: mockDelete,
  } as never);
}

describe('GET /api/users/current-user', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null currentUser when no session cookie', async () => {
    setupCookies();

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.currentUser).toBeNull();
  });

  it('should return 401 and delete cookie when JWT is invalid', async () => {
    setupCookies('invalid_token');
    mockVerifyJWT.mockReturnValue(null);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.currentUser).toBeNull();
    expect(mockDelete).toHaveBeenCalledWith('session');
  });

  it('should return 401 and delete cookie when user no longer exists in DB', async () => {
    setupCookies('valid_token');
    mockVerifyJWT.mockReturnValue({ id: '1', name: 'ghost', iat: 0, exp: 0 });
    mockFindUserByName.mockResolvedValue(null);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.currentUser).toBeNull();
    expect(mockDelete).toHaveBeenCalledWith('session');
  });

  it('should return currentUser with is_admin flag when session is valid', async () => {
    setupCookies('valid_token');
    mockVerifyJWT.mockReturnValue({ id: '1', name: 'admin', iat: 0, exp: 0 });
    mockFindUserByName.mockResolvedValue({ id: 1, name: 'admin', is_admin: true } as never);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.currentUser.name).toBe('admin');
    expect(body.currentUser.is_admin).toBe(true);
  });
});
