import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/lib/database/users/users', () => ({
  findUserByName: vi.fn(),
  saveUser: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock('@/lib/database/users/fingerprint', () => ({
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
import { findUserByName, saveUser } from '@/lib/database/users/users';
import { findSimilarFingerprint, saveFingerprint } from '@/lib/database/users/fingerprint';
import { Password } from '@/lib/helpers/users/password';
import { createJWT } from '@/lib/helpers/users/jwt';
import { POST } from '@/src/app/api/users/signup/route';
import { NextRequest } from 'next/server';

const mockCookies = vi.mocked(cookies);
const mockFindUserByName = vi.mocked(findUserByName);
const mockSaveUser = vi.mocked(saveUser);
const mockFindSimilarFingerprint = vi.mocked(findSimilarFingerprint);
const mockSaveFingerprint = vi.mocked(saveFingerprint);
const mockPasswordHash = vi.mocked(Password.toHash);
const mockCreateJWT = vi.mocked(createJWT);

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/users/signup', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/users/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookies.mockResolvedValue({ set: vi.fn() } as never);
    mockFindUserByName.mockResolvedValue(null);
    mockFindSimilarFingerprint.mockResolvedValue(null);
    mockPasswordHash.mockResolvedValue('hashed_pw');
    mockSaveUser.mockResolvedValue({ id: 1, name: 'newuser' } as never);
    mockSaveFingerprint.mockResolvedValue(undefined);
    mockCreateJWT.mockReturnValue('jwt_token');
  });

  it('should return 400 when name is too short', async () => {
    const res = await POST(makeRequest({ name: 'ab', password: 'password123', fingerprint: 'fp' }));
    expect(res.status).toBe(400);
  });

  it('should return 400 when password is too short', async () => {
    const res = await POST(makeRequest({ name: 'validuser', password: 'short', fingerprint: 'fp' }));
    expect(res.status).toBe(400);
  });

  it('should return 400 when name contains invalid characters', async () => {
    const res = await POST(makeRequest({ name: 'user name!', password: 'password123', fingerprint: 'fp' }));
    expect(res.status).toBe(400);
  });

  it('should return 401 when username is already taken', async () => {
    mockFindUserByName.mockResolvedValue({ id: 1, name: 'existinguser' } as never);

    const res = await POST(makeRequest({ name: 'existinguser', password: 'password123', fingerprint: 'fp' }));
    expect(res.status).toBe(401);
  });

  it('should return 401 when fingerprint is already linked to another user', async () => {
    mockFindSimilarFingerprint.mockResolvedValue({ id: 1 } as never);

    const res = await POST(makeRequest({ name: 'newuser', password: 'password123', fingerprint: 'fp' }));
    expect(res.status).toBe(401);
  });

  it('should create user and return 201 on successful signup', async () => {
    const res = await POST(makeRequest({ name: 'newuser', password: 'password123', fingerprint: 'fp' }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.name).toBe('newuser');
    expect(mockSaveUser).toHaveBeenCalledOnce();
    expect(mockSaveFingerprint).toHaveBeenCalledOnce();
    expect(mockCreateJWT).toHaveBeenCalledOnce();
  });
});
