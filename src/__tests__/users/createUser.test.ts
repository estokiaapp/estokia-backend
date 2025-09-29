import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { type FastifyInstance } from 'fastify';
import { createTestApp } from '../utils/testApp.js';
import { mockUsers } from '../utils/mockData.js';

vi.mock('../../controllers/UserController.js');

describe('Users - Create User', () => {
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

  describe('POST /api/users', () => {
    it('should return 201 for successful user creation', async () => {
      const mockUserController = await import('../../controllers/UserController.js');
      const mockCreateUser = mockUserController.UserController.prototype.createUser = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(201).send({
            id: '1',
            email: mockUsers.createUserRequest.email,
            name: mockUsers.createUserRequest.name
          });
        });

      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: mockUsers.createUserRequest
      });

      expect(response.statusCode).toBe(201);
      expect(mockCreateUser).toHaveBeenCalled();
      
      const result = JSON.parse(response.payload);
      expect(result.email).toBe(mockUsers.createUserRequest.email);
      expect(result.name).toBe(mockUsers.createUserRequest.name);
      expect(result).toHaveProperty('id');
      expect(result).not.toHaveProperty('password'); // Password should not be returned
    });

    it('should return 400 for missing email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: {
          name: 'Test User',
          password: 'password123'
          // missing email
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for missing password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: {
          email: 'test@example.com',
          name: 'Test User'
          // missing password
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: {
          email: 'invalid-email',
          name: 'Test User',
          password: 'password123'
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 409 for duplicate email', async () => {
      const mockUserController = await import('../../controllers/UserController.js');
      mockUserController.UserController.prototype.createUser = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(409).send({
            error: 'User with this email already exists'
          });
        });

      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: mockUsers.createUserRequest
      });

      expect(response.statusCode).toBe(409);
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('error');
    });

    it('should return 400 for empty payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: {}
      });

      expect(response.statusCode).toBe(400);
    });

    it('should accept optional name field', async () => {
      const mockUserController = await import('../../controllers/UserController.js');
      const mockCreateUser = mockUserController.UserController.prototype.createUser = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(201).send({
            id: '1',
            email: 'test@example.com',
            name: null
          });
        });

      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: {
          email: 'test@example.com',
          password: 'password123'
          // name is optional
        }
      });

      expect(response.statusCode).toBe(201);
      expect(mockCreateUser).toHaveBeenCalled();
    });
  });
});