import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { createTestApp } from '../utils/testApp.js';
import { mockProducts } from '../utils/mockData.js';

jest.mock('../../controllers/ProductController.js');

describe('Products - Create Product', () => {
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

  describe('POST /api/products', () => {
    it('should return 201 for successful product creation', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      const mockCreateProduct = mockProductController.ProductController.prototype.createProduct = jest.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(201).send({
            id: '1',
            ...mockProducts.createProductRequest
          });
        });

      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: mockProducts.createProductRequest
      });

      expect(response.statusCode).toBe(201);
      expect(mockCreateProduct).toHaveBeenCalled();
      
      const result = JSON.parse(response.payload);
      expect(result.name).toBe(mockProducts.createProductRequest.name);
      expect(result.sku).toBe(mockProducts.createProductRequest.sku);
      expect(result).toHaveProperty('id');
    });

    it('should return 400 for missing required name', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          sku: 'SKU001',
          sellingPrice: 100
          // missing name
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for missing required sku', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Test Product',
          sellingPrice: 100
          // missing sku
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should accept product with minimal required fields', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      const mockCreateProduct = mockProductController.ProductController.prototype.createProduct = jest.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(201).send({
            id: '1',
            name: 'Minimal Product',
            sku: 'MIN001'
          });
        });

      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Minimal Product',
          sku: 'MIN001'
        }
      });

      expect(response.statusCode).toBe(201);
      expect(mockCreateProduct).toHaveBeenCalled();
    });

    it('should accept product with all optional fields', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      const mockCreateProduct = mockProductController.ProductController.prototype.createProduct = jest.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(201).send({
            id: '1',
            ...mockProducts.createProductRequest
          });
        });

      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: mockProducts.createProductRequest
      });

      expect(response.statusCode).toBe(201);
      expect(mockCreateProduct).toHaveBeenCalled();
    });

    it('should return 409 for duplicate sku', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      mockProductController.ProductController.prototype.createProduct = jest.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(409).send({
            error: 'Product with this SKU already exists'
          });
        });

      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: mockProducts.createProductRequest
      });

      expect(response.statusCode).toBe(409);
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('error');
    });

    it('should return 400 for invalid price values', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Test Product',
          sku: 'SKU001',
          sellingPrice: -10 // negative price
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for invalid stock values', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Test Product',
          sku: 'SKU001',
          currentStock: -5 // negative stock
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for empty payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {}
      });

      expect(response.statusCode).toBe(400);
    });

    it('should handle server errors during creation', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      mockProductController.ProductController.prototype.createProduct = jest.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(500).send({
            error: 'Internal server error'
          });
        });

      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: mockProducts.createProductRequest
      });

      expect(response.statusCode).toBe(500);
    });
  });
});