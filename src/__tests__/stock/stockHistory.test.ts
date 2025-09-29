import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { type FastifyInstance } from 'fastify';
import { createTestApp, generateValidJWT } from '../utils/testApp.js';
import { mockStock } from '../utils/mockData.js';

vi.mock('../../controllers/StockController.js');

describe('Stock - Stock History', () => {
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

  describe('GET /api/products/:id/stock-history', () => {
    it('should return 200 and stock movement history', async () => {
      const mockStockController = await import('../../controllers/StockController.js');
      const mockGetStockHistory = mockStockController.StockController.prototype.getStockHistory = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(200).send({
            product: {
              id: '1',
              name: 'Product 1',
              sku: 'SKU001',
              currentStock: 150
            },
            movements: [mockStock.stockMovement],
            total: 1
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'GET',
        url: '/api/products/1/stock-history',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(mockGetStockHistory).toHaveBeenCalled();

      const result = JSON.parse(response.payload);
      expect(result.product.id).toBe('1');
      expect(result.movements).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should return 200 with filtered history', async () => {
      const mockStockController = await import('../../controllers/StockController.js');
      mockStockController.StockController.prototype.getStockHistory = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(200).send({
            product: {
              id: '1',
              name: 'Product 1',
              sku: 'SKU001',
              currentStock: 150
            },
            movements: [],
            total: 0
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'GET',
        url: '/api/products/1/stock-history?type=IN&startDate=2023-12-01&endDate=2023-12-31',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
    });

    it('should return 404 for non-existent product', async () => {
      const mockStockController = await import('../../controllers/StockController.js');
      mockStockController.StockController.prototype.getStockHistory = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(404).send({
            error: 'Product not found'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'GET',
        url: '/api/products/non-existent/stock-history',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 401 for missing authorization', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/products/1/stock-history'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/stock/movements', () => {
    it('should return 200 and all stock movements', async () => {
      const mockStockController = await import('../../controllers/StockController.js');
      const mockGetAllStockMovements = mockStockController.StockController.prototype.getAllStockMovements = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(200).send({
            movements: [mockStock.stockMovement],
            total: 1
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'GET',
        url: '/api/stock/movements',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(mockGetAllStockMovements).toHaveBeenCalled();

      const result = JSON.parse(response.payload);
      expect(result.movements).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should return 200 with filtered movements', async () => {
      const mockStockController = await import('../../controllers/StockController.js');
      mockStockController.StockController.prototype.getAllStockMovements = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(200).send({
            movements: [],
            total: 0
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'GET',
        url: '/api/stock/movements?type=OUT&userId=1',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });
});