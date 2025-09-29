import type { FastifyInstance } from 'fastify'
import { SalesController } from '../controllers/SalesController.js'
import {
  CREATE_SALE_SCHEMA,
  UPDATE_SALE_STATUS_SCHEMA,
  GET_SALES_SCHEMA,
  GET_SALE_SCHEMA,
  SALES_REPORT_SCHEMA
} from '../dto/request/salesSchemas.js'

interface SaleParams {
  id: string
}

interface SalesQuery {
  startDate?: string
  endDate?: string
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  userId?: number
  limit?: number
  offset?: number
}

interface SalesReportQuery {
  startDate: string
  endDate: string
  groupBy?: 'day' | 'week' | 'month'
  categoryId?: string
  supplierId?: string
}

interface TopProductsQuery {
  startDate?: string
  endDate?: string
  limit?: number
}

interface SalesByPeriodQuery {
  startDate: string
  endDate: string
  groupBy?: 'day' | 'week' | 'month'
}

export async function salesRoutes(fastify: FastifyInstance) {
  const salesController = new SalesController()

  await fastify.register(async function (fastify) {
    await fastify.addHook('onRequest', fastify.authenticate)

    fastify.get<{ Querystring: SalesQuery }>('/sales', {
      schema: GET_SALES_SCHEMA
    }, salesController.getAllSales)

    fastify.get<{ Params: SaleParams }>('/sales/:id', {
      schema: GET_SALE_SCHEMA
    }, salesController.getSaleById)

    fastify.post('/sales', {
      schema: CREATE_SALE_SCHEMA
    }, salesController.createSale)

    fastify.patch<{ Params: SaleParams; Body: { status: 'PENDING' | 'COMPLETED' | 'CANCELLED' } }>('/sales/:id/status', {
      schema: UPDATE_SALE_STATUS_SCHEMA
    }, salesController.updateSaleStatus)

    fastify.get<{ Querystring: SalesReportQuery }>('/reports/sales', {
      schema: SALES_REPORT_SCHEMA
    }, salesController.getSalesReport)

    fastify.get<{ Querystring: TopProductsQuery }>('/reports/top-products', {
      schema: {
        description: 'Get top selling products',
        tags: ['reports'],
        querystring: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 }
          }
        }
      }
    }, salesController.getTopSellingProducts)

    fastify.get<{ Querystring: SalesByPeriodQuery }>('/reports/sales-by-period', {
      schema: {
        description: 'Get sales data grouped by period',
        tags: ['reports'],
        querystring: {
          type: 'object',
          required: ['startDate', 'endDate'],
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            groupBy: {
              type: 'string',
              enum: ['day', 'week', 'month'],
              default: 'day'
            }
          }
        }
      }
    }, salesController.getSalesByPeriod)
  })
}