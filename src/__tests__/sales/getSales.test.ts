import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { type FastifyInstance } from 'fastify';
import { createTestApp, generateValidJWT } from '../utils/testApp.js';
import { mockSales } from '../utils/mockData.js';

vi.mock('../../controllers/SalesController.js');

describe('Sales - Get Sales', () => {
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

  describe('GET /api/sales', () => {
    it('should return 200 and list of sales', async () => {
      const mockSalesController = await import('../../controllers/SalesController.js');
      const mockGetAllSales = mockSalesController.SalesController.prototype.getAllSales = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(200).send({
            sales: [mockSales.validSale],
            total: 1
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'GET',
        url: '/api/sales',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(mockGetAllSales).toHaveBeenCalled();

      const result = JSON.parse(response.payload);
      expect(result.sales).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.sales[0].id).toBe(mockSales.validSale.id);
    });

    it('should return 200 with filtered sales', async () => {
      const mockSalesController = await import('../../controllers/SalesController.js');
      mockSalesController.SalesController.prototype.getAllSales = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(200).send({
            sales: [],
            total: 0
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'GET',
        url: '/api/sales?status=COMPLETED&startDate=2023-12-01&endDate=2023-12-31',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
    });

    it('should return 401 for missing authorization', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/sales'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/sales/:id', () => {
    it('should return 200 and sale details', async () => {
      const mockSalesController = await import('../../controllers/SalesController.js');
      const mockGetSaleById = mockSalesController.SalesController.prototype.getSaleById = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(200).send(mockSales.validSale);
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'GET',
        url: '/api/sales/sale-1',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(mockGetSaleById).toHaveBeenCalled();

      const result = JSON.parse(response.payload);
      expect(result.id).toBe(mockSales.validSale.id);
      expect(result.saleItems).toHaveLength(2);
    });

    it('should return 404 for non-existent sale', async () => {
      const mockSalesController = await import('../../controllers/SalesController.js');
      mockSalesController.SalesController.prototype.getSaleById = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(404).send({
            error: 'Sale not found'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'GET',
        url: '/api/sales/non-existent',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(404);
    });
  });
});