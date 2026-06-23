import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/lib/helpers/users/jwt', () => ({
  verifyJWT: vi.fn(),
}));

import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/helpers/users/jwt';
import { requireAuth } from '@/src/middleware/requireAuth';
import { NextResponse } from 'next/server';

const mockCookies = vi.mocked(cookies);
const mockVerifyJWT = vi.mocked(verifyJWT);

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 response when no session cookie exists', async () => {
    mockCookies.mockResolvedValue({ get: vi.fn(() => undefined) } as never);

    const result = await requireAuth();

    expect(result).toBeInstanceOf(NextResponse);
    const json = await (result as NextResponse).json();
    expect(json.error).toBe('Unauthorized');
    expect((result as NextResponse).status).toBe(401);
  });

  it('should return 401 response when JWT payload has no id', async () => {
    mockCookies.mockResolvedValue({ get: vi.fn(() => ({ value: 'bad_token' })) } as never);
    mockVerifyJWT.mockReturnValue(null);

    const result = await requireAuth();

    expect(result).toBeInstanceOf(NextResponse);
    const json = await (result as NextResponse).json();
    expect(json.error).toBe('Invalid or expired token');
  });

  it('should return user object with numeric user_id when token is valid', async () => {
    mockCookies.mockResolvedValue({ get: vi.fn(() => ({ value: 'valid_token' })) } as never);
    mockVerifyJWT.mockReturnValue({ id: '42', name: 'testuser', iat: 0, exp: 0 });

    const result = await requireAuth();

    expect(result).not.toBeInstanceOf(NextResponse);
    const { user } = result as { user: { user_id: number; name: string } };
    expect(user.user_id).toBe(42);
    expect(user.name).toBe('testuser');
  });

  it('should not call verifyJWT when session cookie is missing', async () => {
    mockCookies.mockResolvedValue({ get: vi.fn(() => undefined) } as never);

    await requireAuth();

    expect(mockVerifyJWT).not.toHaveBeenCalled();
  });
});
