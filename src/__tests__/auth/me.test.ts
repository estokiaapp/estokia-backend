import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { createTestApp, generateValidJWT } from '../utils/testApp.js';
import { mockUsers } from '../utils/mockData.js';

jest.mock('../../controllers/AuthController.js');

describe('Auth - Current User', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/auth/me', () => {
    it('should return 200 and user data for valid token', async () => {
      const mockAuthController = await import('../../controllers/AuthController.js');
      const mockGetCurrentUser = mockAuthController.AuthController.prototype.getCurrentUser = jest.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send(mockUsers.validUser);
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(mockGetCurrentUser).toHaveBeenCalled();
      
      const result = JSON.parse(response.payload);
      expect(result.email).toBe(mockUsers.validUser.email);
      expect(result.id).toBe(mockUsers.validUser.id);
    });

    it('should return 401 for missing authorization header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me'
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 for invalid token format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: 'InvalidToken'
        }
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 for missing Bearer prefix', async () => {
      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: token // missing "Bearer " prefix
        }
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 for expired/invalid JWT token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: 'Bearer invalid.jwt.token'
        }
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 for empty authorization header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: ''
        }
      });

      expect(response.statusCode).toBe(401);
    });
  });
});