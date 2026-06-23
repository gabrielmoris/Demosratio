import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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
import { isAuthorized } from '@/src/middleware/isAuthorized';
import { NextRequest } from 'next/server';

const mockCookies = vi.mocked(cookies);
const mockVerifyJWT = vi.mocked(verifyJWT);
const mockFindUserByName = vi.mocked(findUserByName);

function makeRequest(headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/test', { headers });
}

describe('isAuthorized', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    mockCookies.mockResolvedValue({ get: vi.fn(() => undefined) } as never);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return true when authorization header matches CRON_SECRET', async () => {
    process.env.CRON_SECRET = 'secret123';
    const req = makeRequest({ authorization: 'Bearer secret123' });

    expect(await isAuthorized(req)).toBe(true);
  });

  it('should not short-circuit on CRON_SECRET when header does not match', async () => {
    process.env.CRON_SECRET = 'secret123';
    mockCookies.mockResolvedValue({ get: vi.fn(() => undefined) } as never);
    const req = makeRequest({ authorization: 'Bearer wrong' });

    expect(await isAuthorized(req)).toBe(false);
  });

  it('should return false when there is no session cookie', async () => {
    delete process.env.CRON_SECRET;
    mockCookies.mockResolvedValue({ get: vi.fn(() => undefined) } as never);
    const req = makeRequest();

    expect(await isAuthorized(req)).toBe(false);
  });

  it('should return false when JWT is invalid', async () => {
    delete process.env.CRON_SECRET;
    mockCookies.mockResolvedValue({ get: vi.fn(() => ({ value: 'bad_token' })) } as never);
    mockVerifyJWT.mockReturnValue(null);
    const req = makeRequest();

    expect(await isAuthorized(req)).toBe(false);
  });

  it('should return false when user is not admin', async () => {
    delete process.env.CRON_SECRET;
    mockCookies.mockResolvedValue({ get: vi.fn(() => ({ value: 'valid_token' })) } as never);
    mockVerifyJWT.mockReturnValue({ id: '1', name: 'user', iat: 0, exp: 0 });
    mockFindUserByName.mockResolvedValue({ id: 1, name: 'user', is_admin: false } as never);
    const req = makeRequest();

    expect(await isAuthorized(req)).toBe(false);
  });

  it('should return true when session cookie belongs to an admin user', async () => {
    delete process.env.CRON_SECRET;
    mockCookies.mockResolvedValue({ get: vi.fn(() => ({ value: 'valid_token' })) } as never);
    mockVerifyJWT.mockReturnValue({ id: '1', name: 'admin', iat: 0, exp: 0 });
    mockFindUserByName.mockResolvedValue({ id: 1, name: 'admin', is_admin: true } as never);
    const req = makeRequest();

    expect(await isAuthorized(req)).toBe(true);
  });
});
