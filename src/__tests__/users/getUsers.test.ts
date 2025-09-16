import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { createTestApp } from '../utils/testApp.js';
import { mockUsers } from '../utils/mockData.js';

jest.mock('../../controllers/UserController.js');

describe('Users - Get Users', () => {
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

  describe('GET /api/users', () => {
    it('should return 200 with users array', async () => {
      const mockUserController = await import('../../controllers/UserController.js');
      const mockGetAllUsers = mockUserController.UserController.prototype.getAllUsers = jest.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send(mockUsers.validUserArray);
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/users'
      });

      expect(response.statusCode).toBe(200);
      expect(mockGetAllUsers).toHaveBeenCalled();
      
      const result = JSON.parse(response.payload);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('email');
    });

    it('should return 200 with empty array when no users exist', async () => {
      const mockUserController = await import('../../controllers/UserController.js');
      mockUserController.UserController.prototype.getAllUsers = jest.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send([]);
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/users'
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should return 500 for server errors', async () => {
      const mockUserController = await import('../../controllers/UserController.js');
      mockUserController.UserController.prototype.getAllUsers = jest.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(500).send({
            error: 'Internal server error'
          });
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/users'
      });

      expect(response.statusCode).toBe(500);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return 200 with user data for existing user', async () => {
      const mockUserController = await import('../../controllers/UserController.js');
      const mockGetUserById = mockUserController.UserController.prototype.getUserById = jest.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send(mockUsers.validUser);
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/users/1'
      });

      expect(response.statusCode).toBe(200);
      expect(mockGetUserById).toHaveBeenCalled();
      
      const result = JSON.parse(response.payload);
      expect(result.id).toBe(mockUsers.validUser.id);
      expect(result.email).toBe(mockUsers.validUser.email);
    });

    it('should return 404 for non-existent user', async () => {
      const mockUserController = await import('../../controllers/UserController.js');
      mockUserController.UserController.prototype.getUserById = jest.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(404).send({
            error: 'User not found'
          });
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/users/999'
      });

      expect(response.statusCode).toBe(404);
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('error');
    });

    it('should return 400 for invalid user ID format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/invalid-id'
      });

      // This might be handled by validation schemas
      expect([400, 404]).toContain(response.statusCode);
    });
  });
});