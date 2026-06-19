import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/lib/database/users/users', () => ({
  findUserByName: vi.fn(),
}));

vi.mock('@/lib/database/users/fingerprint', () => ({
  calculateSimilarity: vi.fn(),
  findFingerprintsForUser: vi.fn(),
  findSimilarFingerprint: vi.fn(),
  saveFingerprint: vi.fn(),
}));

vi.mock('@/lib/helpers/users/password', () => ({
  Password: {
    toHash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock('@/lib/helpers/users/jwt', () => ({
  createJWT: vi.fn(),
}));

vi.mock('tslog', () => ({
  Logger: class {
    error = vi.fn();
  },
}));

import { cookies } from 'next/headers';
import { findUserByName } from '@/lib/database/users/users';
import {
  calculateSimilarity,
  findFingerprintsForUser,
  findSimilarFingerprint,
} from '@/lib/database/users/fingerprint';
import { Password } from '@/lib/helpers/users/password';
import { createJWT } from '@/lib/helpers/users/jwt';
import { POST } from '@/src/app/api/users/signin/route';
import { NextRequest } from 'next/server';

const mockCookies = vi.mocked(cookies);
const mockFindUserByName = vi.mocked(findUserByName);
const mockPasswordCompare = vi.mocked(Password.compare);
const mockFindFingerprintsForUser = vi.mocked(findFingerprintsForUser);
const mockCalculateSimilarity = vi.mocked(calculateSimilarity);
const mockFindSimilarFingerprint = vi.mocked(findSimilarFingerprint);
const mockCreateJWT = vi.mocked(createJWT);

const existingUser = { id: 1, name: 'testuser', password: 'hashed', is_admin: false };

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/users/signin', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/users/signin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookies.mockResolvedValue({ set: vi.fn() } as never);
    mockFindUserByName.mockResolvedValue(existingUser as never);
    mockPasswordCompare.mockResolvedValue(true);
    mockFindFingerprintsForUser.mockResolvedValue([{ device_hash: 'known_fp' }] as never);
    mockCalculateSimilarity.mockResolvedValue(1);
    mockCreateJWT.mockReturnValue('jwt_token');
  });

  it('should return 400 when name is invalid', async () => {
    const res = await POST(makeRequest({ name: 'ab', password: 'password123', fingerprint: 'fp' }));
    expect(res.status).toBe(400);
  });

  it('should return 401 when user does not exist', async () => {
    mockFindUserByName.mockResolvedValue(null);

    const res = await POST(makeRequest({ name: 'unknown', password: 'password123', fingerprint: 'fp' }));
    expect(res.status).toBe(401);
  });

  it('should return 401 when password does not match', async () => {
    mockPasswordCompare.mockResolvedValue(false);

    const res = await POST(makeRequest({ name: 'testuser', password: 'wrong', fingerprint: 'fp' }));
    expect(res.status).toBe(401);
  });

  it('should return 401 when fingerprint belongs to a different user', async () => {
    mockCalculateSimilarity.mockResolvedValue(0);
    mockFindSimilarFingerprint.mockResolvedValue({ id: 99 } as never);

    const res = await POST(makeRequest({ name: 'testuser', password: 'password123', fingerprint: 'unknown_fp' }));
    expect(res.status).toBe(401);
  });

  it('should return 200 with user data on successful signin', async () => {
    const res = await POST(makeRequest({ name: 'testuser', password: 'password123', fingerprint: 'known_fp' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.name).toBe('testuser');
    expect(mockCreateJWT).toHaveBeenCalledOnce();
  });
});
