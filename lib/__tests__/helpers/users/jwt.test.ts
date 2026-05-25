import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createJWT, verifyJWT } from '../../../helpers/users/jwt';

// Mock jwt library
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mocked_token'),
    verify: vi.fn(),
  },
}));

// Mock logger
vi.mock('tslog', () => ({
  Logger: class {
    error = vi.fn();
  },
}));

import jwt from 'jsonwebtoken';

const originalEnv = process.env;

describe('JWT Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, JWT_KEY: 'test-secret-key' };
  });

  describe('createJWT', () => {
    it('should create a JWT token with user id and name', () => {
      const user = { id: 'user123', name: 'John Doe' };
      const token = createJWT(user);

      expect(token).toBe('mocked_token');
    });

    it('should call jwt.sign with correct payload', () => {
      const user = { id: 'user123', name: 'John Doe' };

      createJWT(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: user.id,
          name: user.name,
        },
        'test-secret-key',
        { expiresIn: '24h', algorithm: 'HS256' }
      );
    });
  });

  describe('verifyJWT', () => {
    it('should return user payload when token is valid', () => {
      const mockPayload = { id: 'user123', name: 'John Doe' };
      (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValue(mockPayload as jwt.JwtPayload);

      const result = verifyJWT('valid_token');

      expect(result).toEqual(mockPayload);
    });

    it('should return null when token is invalid', () => {
      (jwt.verify as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = verifyJWT('invalid_token');

      expect(result).toBeNull();
    });

    it('should call jwt.verify with token and secret', () => {
      (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValue({ id: 'user123' } as jwt.JwtPayload);

      verifyJWT('some_token');
      expect(jwt.verify).toHaveBeenCalledWith('some_token', 'test-secret-key', {
        algorithms: ['HS256'],
      });
    });
  });
});
