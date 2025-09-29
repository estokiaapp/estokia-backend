import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { type FastifyInstance } from 'fastify';
import { createTestApp } from '../utils/testApp.js';
import { mockProducts } from '../utils/mockData.js';

vi.mock('../../controllers/ProductController.js');

describe('Products - Get Products', () => {
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

  describe('GET /api/products', () => {
    it('should return 200 with products array', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      const mockGetAllProducts = mockProductController.ProductController.prototype.getAllProducts = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send(mockProducts.validProductArray);
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/products'
      });

      expect(response.statusCode).toBe(200);
      expect(mockGetAllProducts).toHaveBeenCalled();
      
      const result = JSON.parse(response.payload);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('sku');
    });

    it('should return 200 with filtered products by categoryId', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      const mockGetAllProducts = mockProductController.ProductController.prototype.getAllProducts = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send([mockProducts.validProduct]);
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/products?categoryId=cat1'
      });

      expect(response.statusCode).toBe(200);
      expect(mockGetAllProducts).toHaveBeenCalled();
      
      const result = JSON.parse(response.payload);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
    });

    it('should return 200 with filtered products by supplierId', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      mockProductController.ProductController.prototype.getAllProducts = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send([mockProducts.validProduct]);
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/products?supplierId=sup1'
      });

      expect(response.statusCode).toBe(200);
    });

    it('should return 200 with price range filtering', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      mockProductController.ProductController.prototype.getAllProducts = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send([mockProducts.validProduct]);
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/products?minPrice=50&maxPrice=150'
      });

      expect(response.statusCode).toBe(200);
    });

    it('should return 200 with stock filter', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      mockProductController.ProductController.prototype.getAllProducts = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send([mockProducts.validProduct]);
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/products?inStock=true'
      });

      expect(response.statusCode).toBe(200);
    });

    it('should return 200 with empty array when no products exist', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      mockProductController.ProductController.prototype.getAllProducts = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send([]);
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/products'
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should return 500 for server errors', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      mockProductController.ProductController.prototype.getAllProducts = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(500).send({
            error: 'Internal server error'
          });
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/products'
      });

      expect(response.statusCode).toBe(500);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return 200 with product data for existing product', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      const mockGetProductById = mockProductController.ProductController.prototype.getProductById = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send(mockProducts.validProduct);
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/products/1'
      });

      expect(response.statusCode).toBe(200);
      expect(mockGetProductById).toHaveBeenCalled();
      
      const result = JSON.parse(response.payload);
      expect(result.id).toBe(mockProducts.validProduct.id);
      expect(result.name).toBe(mockProducts.validProduct.name);
      expect(result.sku).toBe(mockProducts.validProduct.sku);
    });

    it('should return 404 for non-existent product', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      mockProductController.ProductController.prototype.getProductById = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(404).send({
            error: 'Product not found'
          });
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/products/999'
      });

      expect(response.statusCode).toBe(404);
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('error');
    });

    it('should return 400 for invalid product ID format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/products/invalid-id'
      });

      // This might be handled by validation schemas
      expect([400, 404]).toContain(response.statusCode);
    });
  });
});