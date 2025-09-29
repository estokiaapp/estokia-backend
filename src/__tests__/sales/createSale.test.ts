import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { type FastifyInstance } from 'fastify';
import { createTestApp, generateValidJWT } from '../utils/testApp.js';
import { mockSales } from '../utils/mockData.js';

vi.mock('../../controllers/SalesController.js');

describe('Sales - Create Sale', () => {
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

  describe('POST /api/sales', () => {
    it('should return 201 for successful sale creation', async () => {
      const mockSalesController = await import('../../controllers/SalesController.js');
      const mockCreateSale = mockSalesController.SalesController.prototype.createSale = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(201).send(mockSales.validSale);
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'POST',
        url: '/api/sales',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: mockSales.createSaleRequest
      });

      expect(response.statusCode).toBe(201);
      expect(mockCreateSale).toHaveBeenCalled();

      const result = JSON.parse(response.payload);
      expect(result.id).toBe(mockSales.validSale.id);
      expect(result.saleNumber).toBe(mockSales.validSale.saleNumber);
      expect(result.totalAmount).toBe(mockSales.validSale.totalAmount);
      expect(result.saleItems).toHaveLength(2);
    });

    it('should return 400 for invalid sale data', async () => {
      const mockSalesController = await import('../../controllers/SalesController.js');
      mockSalesController.SalesController.prototype.createSale = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(400).send({
            error: 'Invalid sale data'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'POST',
        url: '/api/sales',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          saleItems: [] // Invalid: empty items
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 401 for missing authorization', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/sales',
        payload: mockSales.createSaleRequest
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 400 for insufficient stock', async () => {
      const mockSalesController = await import('../../controllers/SalesController.js');
      mockSalesController.SalesController.prototype.createSale = vi.fn()
        .mockImplementation(async (request: any, reply: any) => {
          return reply.code(400).send({
            error: 'Insufficient stock for product Product 1'
          });
        });

      const token = generateValidJWT(app);

      const response = await app.inject({
        method: 'POST',
        url: '/api/sales',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          saleItems: [
            {
              productId: '1',
              quantity: 1000, // Very high quantity
              unitPrice: 100
            }
          ]
        }
      });

      expect(response.statusCode).toBe(400);
      const result = JSON.parse(response.payload);
      expect(result.error).toContain('Insufficient stock');
    });
  });
});