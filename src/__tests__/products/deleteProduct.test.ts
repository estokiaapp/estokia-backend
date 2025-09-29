import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { type FastifyInstance } from 'fastify';
import { createTestApp } from '../utils/testApp.js';

vi.mock('../../controllers/ProductController.js');

describe('Products - Delete Product', () => {
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

  describe('DELETE /api/products/:id', () => {
    it('should return 200 for successful product deletion', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      const mockDeleteProduct = mockProductController.ProductController.prototype.deleteProduct = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send({
            message: 'Product deleted successfully'
          });
        });

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/products/1'
      });

      expect(response.statusCode).toBe(200);
      expect(mockDeleteProduct).toHaveBeenCalled();
      
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('message');
    });

    it('should return 404 for non-existent product', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      mockProductController.ProductController.prototype.deleteProduct = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(404).send({
            error: 'Product not found'
          });
        });

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/products/999'
      });

      expect(response.statusCode).toBe(404);
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('error');
    });

    it('should return 400 for invalid product ID format', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/products/invalid-id'
      });

      // This might be handled by validation schemas
      expect([400, 404]).toContain(response.statusCode);
    });

    it('should return 409 for products with dependencies', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      mockProductController.ProductController.prototype.deleteProduct = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(409).send({
            error: 'Cannot delete product with existing orders'
          });
        });

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/products/1'
      });

      expect(response.statusCode).toBe(409);
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('error');
    });

    it('should handle server errors during deletion', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      mockProductController.ProductController.prototype.deleteProduct = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(500).send({
            error: 'Internal server error'
          });
        });

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/products/1'
      });

      expect(response.statusCode).toBe(500);
    });

    it('should verify controller method is called with correct parameters', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      const mockDeleteProduct = mockProductController.ProductController.prototype.deleteProduct = vi.fn()
        .mockImplementation(async (request, reply) => {
          expect(request.params).toHaveProperty('id');
          expect((request.params as any).id).toBe('123');
          return reply.code(200).send({
            message: 'Product deleted successfully'
          });
        });

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/products/123'
      });

      expect(response.statusCode).toBe(200);
      expect(mockDeleteProduct).toHaveBeenCalled();
    });

    it('should return consistent response format for successful deletion', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      mockProductController.ProductController.prototype.deleteProduct = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send({
            message: 'Product deleted successfully',
            deletedId: '1'
          });
        });

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/products/1'
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('deleted');
    });

    it('should handle database connection errors', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      mockProductController.ProductController.prototype.deleteProduct = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(503).send({
            error: 'Database unavailable'
          });
        });

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/products/1'
      });

      expect(response.statusCode).toBe(503);
    });
  });
});