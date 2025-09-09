import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createTestApp } from '../utils/testApp.js';
import { mockAuth } from '../utils/mockData.js';

vi.mock('../../controllers/AuthController.js');

describe('Auth - Login', () => {
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

  describe('POST /api/auth/login', () => {
    it('should return 200 and token for valid credentials', async () => {
      const mockAuthController = await import('../../controllers/AuthController.js');
      const mockLogin = mockAuthController.AuthController.prototype.login = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send(mockAuth.loginResponse);
        });

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: mockAuth.loginRequest
      });

      expect(response.statusCode).toBe(200);
      expect(mockLogin).toHaveBeenCalled();
      
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(mockAuth.loginRequest.email);
    });

    it('should return 401 for invalid credentials', async () => {
      const mockAuthController = await import('../../controllers/AuthController.js');
      mockAuthController.AuthController.prototype.login = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(401).send({
            error: 'Invalid credentials'
          });
        });

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: mockAuth.invalidLoginRequest
      });

      expect(response.statusCode).toBe(401);
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('error');
    });

    it('should return 400 for missing email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          password: 'password123'
          // missing email
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for missing password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'test@example.com'
          // missing password
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'invalid-email',
          password: 'password123'
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for empty payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {}
      });

      expect(response.statusCode).toBe(400);
    });
  });
});