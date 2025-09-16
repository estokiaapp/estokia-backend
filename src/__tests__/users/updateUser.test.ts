import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { createTestApp, generateValidJWT } from '../utils/testApp.js';
import { mockUsers } from '../utils/mockData.js';

jest.mock('../../controllers/UserController.js');

describe('Users - Update User', () => {
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

  describe('PUT /api/users/:id', () => {
    it('should return 401 for missing authentication', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/1',
        payload: mockUsers.updateUserRequest
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 200 for successful update with valid token', async () => {
      const mockUserController = await import('../../controllers/UserController.js');
      const mockUpdateUser = mockUserController.UserController.prototype.updateUser = jest.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send({
            id: '1',
            email: mockUsers.updateUserRequest.email,
            name: mockUsers.updateUserRequest.name
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/1',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: mockUsers.updateUserRequest
      });

      expect(response.statusCode).toBe(200);
      expect(mockUpdateUser).toHaveBeenCalled();
      
      const result = JSON.parse(response.payload);
      expect(result.name).toBe(mockUsers.updateUserRequest.name);
      expect(result.email).toBe(mockUsers.updateUserRequest.email);
    });

    it('should return 404 for non-existent user', async () => {
      const mockUserController = await import('../../controllers/UserController.js');
      mockUserController.UserController.prototype.updateUser = jest.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(404).send({
            error: 'User not found'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/999',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: mockUsers.updateUserRequest
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 401 for invalid token', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/1',
        headers: {
          authorization: 'Bearer invalid.jwt.token'
        },
        payload: mockUsers.updateUserRequest
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 400 for invalid email format', async () => {
      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/1',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          email: 'invalid-email',
          name: 'Updated Name'
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should allow partial updates', async () => {
      const mockUserController = await import('../../controllers/UserController.js');
      const mockUpdateUser = mockUserController.UserController.prototype.updateUser = jest.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send({
            id: '1',
            email: 'original@example.com',
            name: 'Updated Name Only'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/1',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          name: 'Updated Name Only'
          // only updating name, not email
        }
      });

      expect(response.statusCode).toBe(200);
      expect(mockUpdateUser).toHaveBeenCalled();
    });

    it('should return 409 for duplicate email conflict', async () => {
      const mockUserController = await import('../../controllers/UserController.js');
      mockUserController.UserController.prototype.updateUser = jest.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(409).send({
            error: 'Email already exists'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/1',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          email: 'existing@example.com'
        }
      });

      expect(response.statusCode).toBe(409);
    });
  });
});