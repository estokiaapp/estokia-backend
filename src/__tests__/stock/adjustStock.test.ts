import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { type FastifyInstance } from 'fastify';
import { createTestApp, generateValidJWT } from '../utils/testApp.js';
import { mockStock } from '../utils/mockData.js';

vi.mock('../../controllers/StockController.js');

describe('Stock - Adjust Stock', () => {
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

  describe('PUT /api/products/:id/stock', () => {
    it('should return 200 for successful stock adjustment', async () => {
      const mockStockController = await import('../../controllers/StockController.js');
      const mockAdjustStock = mockStockController.StockController.prototype.adjustStock = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(200).send({
            id: '1',
            currentStock: 150,
            movement: mockStock.stockMovement
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/1/stock',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: mockStock.stockAdjustmentRequest
      });

      expect(response.statusCode).toBe(200);
      expect(mockAdjustStock).toHaveBeenCalled();

      const result = JSON.parse(response.payload);
      expect(result.id).toBe('1');
      expect(result.currentStock).toBe(150);
      expect(result.movement).toBeDefined();
    });

    it('should return 404 for non-existent product', async () => {
      const mockStockController = await import('../../controllers/StockController.js');
      mockStockController.StockController.prototype.adjustStock = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(404).send({
            error: 'Product not found'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/non-existent/stock',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: mockStock.stockAdjustmentRequest
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 400 for insufficient stock on OUT operation', async () => {
      const mockStockController = await import('../../controllers/StockController.js');
      mockStockController.StockController.prototype.adjustStock = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(400).send({
            error: 'Insufficient stock. Available: 10, Requested: 50'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/1/stock',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          quantity: 50,
          type: 'OUT',
          reason: 'Sale'
        }
      });

      expect(response.statusCode).toBe(400);
      const result = JSON.parse(response.payload);
      expect(result.error).toContain('Insufficient stock');
    });

    it('should return 401 for missing authorization', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/1/stock',
        payload: mockStock.stockAdjustmentRequest
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 400 for inactive product', async () => {
      const mockStockController = await import('../../controllers/StockController.js');
      mockStockController.StockController.prototype.adjustStock = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(400).send({
            error: 'Cannot adjust stock for inactive product'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/1/stock',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: mockStock.stockAdjustmentRequest
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/stock/bulk-adjust', () => {
    it('should return 200 for successful bulk adjustment', async () => {
      const mockStockController = await import('../../controllers/StockController.js');
      const mockBulkAdjustStock = mockStockController.StockController.prototype.bulkAdjustStock = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(200).send({
            success: true,
            processed: 2,
            results: [
              {
                productId: '1',
                success: true,
                currentStock: 150
              },
              {
                productId: '2',
                success: true,
                currentStock: 40
              }
            ]
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'POST',
        url: '/api/stock/bulk-adjust',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: mockStock.bulkStockAdjustmentRequest
      });

      expect(response.statusCode).toBe(200);
      expect(mockBulkAdjustStock).toHaveBeenCalled();

      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.processed).toBe(2);
      expect(result.results).toHaveLength(2);
    });

    it('should return 200 with mixed results for partial success', async () => {
      const mockStockController = await import('../../controllers/StockController.js');
      mockStockController.StockController.prototype.bulkAdjustStock = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(200).send({
            success: false,
            processed: 2,
            results: [
              {
                productId: '1',
                success: true,
                currentStock: 150
              },
              {
                productId: '2',
                success: false,
                error: 'Product not found'
              }
            ]
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'POST',
        url: '/api/stock/bulk-adjust',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: mockStock.bulkStockAdjustmentRequest
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(false);
      expect(result.results[1].success).toBe(false);
    });
  });
});