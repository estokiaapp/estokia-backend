import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { type FastifyInstance } from 'fastify';
import { createTestApp, generateValidJWT } from '../utils/testApp.js';
import { mockStock } from '../utils/mockData.js';

vi.mock('../../controllers/StockController.js');

describe('Stock - Inventory Reports', () => {
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

  describe('GET /api/reports/inventory', () => {
    it('should return 200 and inventory report', async () => {
      const mockStockController = await import('../../controllers/StockController.js');
      const mockGetInventoryReport = mockStockController.StockController.prototype.getInventoryReport = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(200).send(mockStock.inventoryReport);
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'GET',
        url: '/api/reports/inventory',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(mockGetInventoryReport).toHaveBeenCalled();

      const result = JSON.parse(response.payload);
      expect(result.summary).toBeDefined();
      expect(result.summary.totalProducts).toBe(10);
      expect(result.summary.totalValue).toBe(15000);
      expect(result.products).toHaveLength(1);
    });

    it('should return 200 with filtered inventory report', async () => {
      const mockStockController = await import('../../controllers/StockController.js');
      mockStockController.StockController.prototype.getInventoryReport = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(200).send({
            summary: {
              totalProducts: 5,
              totalValue: 7500,
              lowStockProducts: 1,
              outOfStockProducts: 0
            },
            products: []
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'GET',
        url: '/api/reports/inventory?categoryId=cat1&lowStockOnly=true',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
    });

    it('should return 401 for missing authorization', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/reports/inventory'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/stock/low-stock', () => {
    it('should return 200 and low stock products', async () => {
      const mockStockController = await import('../../controllers/StockController.js');
      const mockGetLowStockProducts = mockStockController.StockController.prototype.getLowStockProducts = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(200).send([
            {
              id: '1',
              name: 'Product 1',
              sku: 'SKU001',
              currentStock: 5,
              minimumStock: 10,
              category: {
                id: 'cat1',
                name: 'Category 1'
              }
            }
          ]);
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'GET',
        url: '/api/stock/low-stock',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(mockGetLowStockProducts).toHaveBeenCalled();

      const result = JSON.parse(response.payload);
      expect(result).toHaveLength(1);
      expect(result[0].currentStock).toBeLessThan(result[0].minimumStock);
    });
  });

  describe('GET /api/products/:id/stock-limits', () => {
    it('should return 200 for successful stock limits update', async () => {
      const mockStockController = await import('../../controllers/StockController.js');
      const mockUpdateStockLimits = mockStockController.StockController.prototype.updateStockLimits = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(200).send({
            id: '1',
            name: 'Product 1',
            sku: 'SKU001',
            currentStock: 50,
            minimumStock: 20,
            maximumStock: 200
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/products/1/stock-limits',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          minimumStock: 20,
          maximumStock: 200
        }
      });

      expect(response.statusCode).toBe(200);
      expect(mockUpdateStockLimits).toHaveBeenCalled();

      const result = JSON.parse(response.payload);
      expect(result.minimumStock).toBe(20);
      expect(result.maximumStock).toBe(200);
    });

    it('should return 400 for invalid stock limits', async () => {
      const mockStockController = await import('../../controllers/StockController.js');
      mockStockController.StockController.prototype.updateStockLimits = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(400).send({
            error: 'Maximum stock cannot be less than minimum stock'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/products/1/stock-limits',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          minimumStock: 100,
          maximumStock: 50
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/reports/stock-value', () => {
    it('should return 200 and stock value report', async () => {
      const mockStockController = await import('../../controllers/StockController.js');
      const mockGetStockValueReport = mockStockController.StockController.prototype.getStockValueReport = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(200).send({
            totalValue: 15000,
            byCategory: [
              { name: 'Category 1', value: 8000 },
              { name: 'Category 2', value: 7000 }
            ],
            bySupplier: [
              { name: 'Supplier 1', value: 10000 },
              { name: 'Supplier 2', value: 5000 }
            ],
            lowValueProducts: [],
            highValueProducts: []
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'GET',
        url: '/api/reports/stock-value',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(mockGetStockValueReport).toHaveBeenCalled();

      const result = JSON.parse(response.payload);
      expect(result.totalValue).toBe(15000);
      expect(result.byCategory).toHaveLength(2);
      expect(result.bySupplier).toHaveLength(2);
    });
  });
});