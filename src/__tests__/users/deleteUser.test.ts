import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { type FastifyInstance } from 'fastify';
import { createTestApp, generateValidJWT } from '../utils/testApp.js';

vi.mock('../../controllers/UserController.js');

describe('Users - Delete User', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DELETE /api/users/:id', () => {
    it('should return 401 for missing authentication', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/users/1'
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 200 for successful deletion with valid token', async () => {
      const mockUserController = await import('../../controllers/UserController.js');
      const mockDeleteUser = mockUserController.UserController.prototype.deleteUser = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send({
            message: 'User deleted successfully'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/users/1',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(mockDeleteUser).toHaveBeenCalled();
      
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('message');
    });

    it('should return 404 for non-existent user', async () => {
      const mockUserController = await import('../../controllers/UserController.js');
      mockUserController.UserController.prototype.deleteUser = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(404).send({
            error: 'User not found'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/users/999',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(404);
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('error');
    });

    it('should return 401 for invalid token', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/users/1',
        headers: {
          authorization: 'Bearer invalid.jwt.token'
        }
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 for missing Bearer prefix', async () => {
      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/users/1',
        headers: {
          authorization: token // missing "Bearer " prefix
        }
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 500 for server errors during deletion', async () => {
      const mockUserController = await import('../../controllers/UserController.js');
      mockUserController.UserController.prototype.deleteUser = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(500).send({
            error: 'Internal server error'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/users/1',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(500);
    });

    it('should handle authorization edge cases', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/users/1',
        headers: {
          authorization: '' // empty authorization header
        }
      });

      expect(response.statusCode).toBe(401);
    });
  });
});