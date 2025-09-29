import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { type FastifyInstance } from 'fastify';
import { createTestApp } from '../utils/testApp.js';
import { mockProducts } from '../utils/mockData.js';

vi.mock('../../controllers/ProductController.js');

describe('Products - Update Product', () => {
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

  describe('PUT /api/products/:id', () => {
    it('should return 200 for successful product update', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      const mockUpdateProduct = mockProductController.ProductController.prototype.updateProduct = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send({
            id: '1',
            name: mockProducts.updateProductRequest.name,
            sku: 'SKU001',
            sellingPrice: mockProducts.updateProductRequest.sellingPrice,
            currentStock: mockProducts.updateProductRequest.currentStock
          });
        });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/1',
        payload: mockProducts.updateProductRequest
      });

      expect(response.statusCode).toBe(200);
      expect(mockUpdateProduct).toHaveBeenCalled();
      
      const result = JSON.parse(response.payload);
      expect(result.name).toBe(mockProducts.updateProductRequest.name);
      expect(result.sellingPrice).toBe(mockProducts.updateProductRequest.sellingPrice);
    });

    it('should return 404 for non-existent product', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      mockProductController.ProductController.prototype.updateProduct = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(404).send({
            error: 'Product not found'
          });
        });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/999',
        payload: mockProducts.updateProductRequest
      });

      expect(response.statusCode).toBe(404);
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('error');
    });

    it('should allow partial updates', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      const mockUpdateProduct = mockProductController.ProductController.prototype.updateProduct = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send({
            id: '1',
            name: 'Updated Name Only',
            sku: 'SKU001',
            sellingPrice: 100, // original price
            currentStock: 50   // original stock
          });
        });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/1',
        payload: {
          name: 'Updated Name Only'
          // only updating name
        }
      });

      expect(response.statusCode).toBe(200);
      expect(mockUpdateProduct).toHaveBeenCalled();
      
      const result = JSON.parse(response.payload);
      expect(result.name).toBe('Updated Name Only');
    });

    it('should return 409 for duplicate sku conflict', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      mockProductController.ProductController.prototype.updateProduct = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(409).send({
            error: 'SKU already exists'
          });
        });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/1',
        payload: {
          sku: 'EXISTING-SKU'
        }
      });

      expect(response.statusCode).toBe(409);
    });

    it('should return 400 for invalid price values', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/1',
        payload: {
          sellingPrice: -50 // negative price
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for invalid stock values', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/1',
        payload: {
          currentStock: -10 // negative stock
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should update inventory-related fields', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      const mockUpdateProduct = mockProductController.ProductController.prototype.updateProduct = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send({
            id: '1',
            name: 'Product 1',
            sku: 'SKU001',
            currentStock: 100,
            minimumStock: 10,
            maximumStock: 500
          });
        });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/1',
        payload: {
          currentStock: 100,
          minimumStock: 10,
          maximumStock: 500
        }
      });

      expect(response.statusCode).toBe(200);
      expect(mockUpdateProduct).toHaveBeenCalled();
    });

    it('should update category and supplier references', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      const mockUpdateProduct = mockProductController.ProductController.prototype.updateProduct = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(200).send({
            id: '1',
            name: 'Product 1',
            sku: 'SKU001',
            categoryId: 'new-category',
            supplierId: 'new-supplier'
          });
        });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/1',
        payload: {
          categoryId: 'new-category',
          supplierId: 'new-supplier'
        }
      });

      expect(response.statusCode).toBe(200);
      expect(mockUpdateProduct).toHaveBeenCalled();
    });

    it('should handle server errors during update', async () => {
      const mockProductController = await import('../../controllers/ProductController.js');
      mockProductController.ProductController.prototype.updateProduct = vi.fn()
        .mockImplementation(async (request, reply) => {
          return reply.code(500).send({
            error: 'Internal server error'
          });
        });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/1',
        payload: mockProducts.updateProductRequest
      });

      expect(response.statusCode).toBe(500);
    });
  });
});