import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { type FastifyInstance } from 'fastify';
import { createTestApp, generateValidJWT } from '../utils/testApp.js';
import { mockSales } from '../utils/mockData.js';

vi.mock('../../controllers/SalesController.js');

describe('Sales - Update Sale Status', () => {
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

  describe('PATCH /api/sales/:id/status', () => {
    it('should return 200 for successful status update', async () => {
      const mockSalesController = await import('../../controllers/SalesController.js');
      const mockUpdateSaleStatus = mockSalesController.SalesController.prototype.updateSaleStatus = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(200).send({
            ...mockSales.validSale,
            status: 'COMPLETED'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/sales/sale-1/status',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: mockSales.updateStatusRequest
      });

      expect(response.statusCode).toBe(200);
      expect(mockUpdateSaleStatus).toHaveBeenCalled();

      const result = JSON.parse(response.payload);
      expect(result.status).toBe('COMPLETED');
    });

    it('should return 404 for non-existent sale', async () => {
      const mockSalesController = await import('../../controllers/SalesController.js');
      mockSalesController.SalesController.prototype.updateSaleStatus = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(404).send({
            error: 'Sale not found'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/sales/non-existent/status',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: mockSales.updateStatusRequest
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 400 for invalid status', async () => {
      const mockSalesController = await import('../../controllers/SalesController.js');
      mockSalesController.SalesController.prototype.updateSaleStatus = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(400).send({
            error: 'Sale is already COMPLETED'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/sales/sale-1/status',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          status: 'COMPLETED'
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 401 for missing authorization', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/sales/sale-1/status',
        payload: mockSales.updateStatusRequest
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 400 for insufficient stock on completion', async () => {
      const mockSalesController = await import('../../controllers/SalesController.js');
      mockSalesController.SalesController.prototype.updateSaleStatus = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(400).send({
            error: 'Insufficient stock for product Product 1. Available: 5, Required: 10'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/sales/sale-1/status',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          status: 'COMPLETED'
        }
      });

      expect(response.statusCode).toBe(400);
      const result = JSON.parse(response.payload);
      expect(result.error).toContain('Insufficient stock');
    });
  });
});