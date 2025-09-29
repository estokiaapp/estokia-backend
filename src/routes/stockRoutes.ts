import type { FastifyInstance } from 'fastify'
import { StockController } from '../controllers/StockController.js'
import {
  STOCK_ADJUSTMENT_SCHEMA,
  BULK_STOCK_ADJUSTMENT_SCHEMA,
  GET_STOCK_HISTORY_SCHEMA,
  INVENTORY_REPORT_SCHEMA
} from '../dto/request/stockSchemas.js'

interface ProductParams {
  id: string
}

interface StockHistoryQuery {
  startDate?: string
  endDate?: string
  type?: 'IN' | 'OUT' | 'ADJUSTMENT'
  userId?: number
  limit?: number
  offset?: number
}

interface InventoryReportQuery {
  categoryId?: string
  supplierId?: string
  lowStockOnly?: boolean
  includeInactive?: boolean
}

interface StockValueReportQuery {
  categoryId?: string
  supplierId?: string
}

interface StockTrendsQuery {
  days?: number
}

interface StockMovementsByDateQuery {
  startDate: string
  endDate: string
}

export async function stockRoutes(fastify: FastifyInstance) {
  const stockController = new StockController()

  await fastify.register(async function (fastify) {
    await fastify.addHook('onRequest', fastify.authenticate)

    fastify.put<{ Params: ProductParams; Body: any }>('/products/:id/stock', {
      schema: STOCK_ADJUSTMENT_SCHEMA
    }, stockController.adjustStock)

    fastify.post('/stock/bulk-adjust', {
      schema: BULK_STOCK_ADJUSTMENT_SCHEMA
    }, stockController.bulkAdjustStock)

    fastify.get<{ Params: ProductParams; Querystring: StockHistoryQuery }>('/products/:id/stock-history', {
      schema: GET_STOCK_HISTORY_SCHEMA
    }, stockController.getStockHistory)

    fastify.get<{ Querystring: StockHistoryQuery }>('/stock/movements', {
      schema: {
        description: 'Get all stock movements',
        tags: ['stock'],
        querystring: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            type: {
              type: 'string',
              enum: ['IN', 'OUT', 'ADJUSTMENT']
            },
            userId: { type: 'integer' },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
            offset: { type: 'integer', minimum: 0, default: 0 }
          }
        }
      }
    }, stockController.getAllStockMovements)

    fastify.get<{ Querystring: InventoryReportQuery }>('/reports/inventory', {
      schema: INVENTORY_REPORT_SCHEMA
    }, stockController.getInventoryReport)

    fastify.get('/stock/low-stock', {
      schema: {
        description: 'Get products with low stock',
        tags: ['stock'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                sku: { type: 'string' },
                currentStock: { type: 'integer' },
                minimumStock: { type: 'integer' },
                category: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }, stockController.getLowStockProducts)

    fastify.patch<{ Params: ProductParams; Body: any }>('/products/:id/stock-limits', {
      schema: {
        description: 'Update product stock limits',
        tags: ['stock'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        },
        body: {
          type: 'object',
          properties: {
            minimumStock: { type: 'integer', minimum: 0 },
            maximumStock: { type: 'integer', minimum: 0 }
          }
        }
      }
    }, stockController.updateStockLimits)

    fastify.get<{ Querystring: StockValueReportQuery }>('/reports/stock-value', {
      schema: {
        description: 'Get stock value report',
        tags: ['reports'],
        querystring: {
          type: 'object',
          properties: {
            categoryId: { type: 'string' },
            supplierId: { type: 'string' }
          }
        }
      }
    }, stockController.getStockValueReport)

    fastify.get<{ Params: ProductParams; Querystring: StockTrendsQuery }>('/products/:id/stock-trends', {
      schema: {
        description: 'Get stock movement trends for a product',
        tags: ['stock'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        },
        querystring: {
          type: 'object',
          properties: {
            days: { type: 'integer', minimum: 1, maximum: 365, default: 30 }
          }
        }
      }
    }, stockController.getStockTrends)

    fastify.get<{ Querystring: StockMovementsByDateQuery }>('/stock/movements-by-date', {
      schema: {
        description: 'Get stock movements by date range',
        tags: ['stock'],
        querystring: {
          type: 'object',
          required: ['startDate', 'endDate'],
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' }
          }
        }
      }
    }, stockController.getStockMovementsByDateRange)
  })
}