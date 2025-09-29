import type { FastifyRequest, FastifyReply } from 'fastify'
import { StockService } from '../services/StockService.js'

interface StockAdjustmentBody {
  quantity: number
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  reason?: string
  notes?: string
  unitPrice?: number
}

interface BulkStockAdjustmentBody {
  adjustments: Array<{
    productId: string
    quantity: number
    type: 'IN' | 'OUT' | 'ADJUSTMENT'
    reason?: string
    notes?: string
    unitPrice?: number
  }>
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

interface StockLimitsBody {
  minimumStock?: number
  maximumStock?: number
}

export class StockController {
  private stockService = new StockService()

  adjustStock = async (
    request: FastifyRequest<{ Params: { id: string }; Body: StockAdjustmentBody }>,
    reply: FastifyReply
  ) => {
    try {
      const userId = (request as any).user?.id
      if (!userId) {
        return reply.status(401).send({ error: 'Authentication required' })
      }

      const { id } = request.params
      const adjustmentData = {
        userId,
        type: request.body.type,
        quantity: request.body.quantity,
        unitPrice: request.body.unitPrice,
        reason: request.body.reason,
        notes: request.body.notes
      }

      const result = await this.stockService.adjustStock(id, adjustmentData)
      reply.send(result)
    } catch (error: any) {
      if (error.message === 'Product not found') {
        reply.status(404).send({ error: error.message })
      } else if (error.message.includes('Insufficient stock') || error.message.includes('inactive')) {
        reply.status(400).send({ error: error.message })
      } else {
        reply.status(500).send({ error: error.message })
      }
    }
  }

  bulkAdjustStock = async (request: FastifyRequest<{ Body: BulkStockAdjustmentBody }>, reply: FastifyReply) => {
    try {
      const userId = (request as any).user?.id
      if (!userId) {
        return reply.status(401).send({ error: 'Authentication required' })
      }

      const adjustments = request.body.adjustments.map(adj => ({
        ...adj,
        userId
      }))

      const result = await this.stockService.bulkAdjustStock({ adjustments })
      reply.send(result)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }

  getStockHistory = async (
    request: FastifyRequest<{ Params: { id: string }; Querystring: StockHistoryQuery }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params
      const filters = {
        startDate: request.query.startDate,
        endDate: request.query.endDate,
        type: request.query.type,
        userId: request.query.userId,
        limit: request.query.limit || 50,
        offset: request.query.offset || 0
      }

      const result = await this.stockService.getStockHistory(id, filters)
      reply.send(result)
    } catch (error: any) {
      if (error.message === 'Product not found') {
        reply.status(404).send({ error: error.message })
      } else {
        reply.status(500).send({ error: error.message })
      }
    }
  }

  getAllStockMovements = async (request: FastifyRequest<{ Querystring: StockHistoryQuery }>, reply: FastifyReply) => {
    try {
      const filters = {
        startDate: request.query.startDate,
        endDate: request.query.endDate,
        type: request.query.type,
        userId: request.query.userId,
        limit: request.query.limit || 50,
        offset: request.query.offset || 0
      }

      const result = await this.stockService.getAllStockMovements(filters)
      reply.send(result)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }

  getInventoryReport = async (request: FastifyRequest<{ Querystring: InventoryReportQuery }>, reply: FastifyReply) => {
    try {
      const filters = {
        categoryId: request.query.categoryId,
        supplierId: request.query.supplierId,
        lowStockOnly: request.query.lowStockOnly || false,
        includeInactive: request.query.includeInactive || false
      }

      const report = await this.stockService.getInventoryReport(filters)
      reply.send(report)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }

  getLowStockProducts = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const products = await this.stockService.getLowStockProducts()
      reply.send(products)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }

  updateStockLimits = async (
    request: FastifyRequest<{ Params: { id: string }; Body: StockLimitsBody }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params
      const limits = {
        minimumStock: request.body.minimumStock,
        maximumStock: request.body.maximumStock
      }

      const product = await this.stockService.updateStockLimits(id, limits)
      reply.send(product)
    } catch (error: any) {
      if (error.message === 'Product not found') {
        reply.status(404).send({ error: error.message })
      } else if (error.message.includes('cannot be')) {
        reply.status(400).send({ error: error.message })
      } else {
        reply.status(500).send({ error: error.message })
      }
    }
  }

  getStockValueReport = async (
    request: FastifyRequest<{
      Querystring: {
        categoryId?: string
        supplierId?: string
      }
    }>,
    reply: FastifyReply
  ) => {
    try {
      const filters = {
        categoryId: request.query.categoryId,
        supplierId: request.query.supplierId
      }

      const report = await this.stockService.getStockValueReport(filters)
      reply.send(report)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }

  getStockTrends = async (
    request: FastifyRequest<{
      Params: { id: string }
      Querystring: { days?: number }
    }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params
      const days = request.query.days || 30

      const trends = await this.stockService.getStockTrends(id, days)
      reply.send(trends)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }

  getStockMovementsByDateRange = async (
    request: FastifyRequest<{
      Querystring: {
        startDate: string
        endDate: string
      }
    }>,
    reply: FastifyReply
  ) => {
    try {
      const { startDate, endDate } = request.query
      const movements = await this.stockService.getStockMovementsByDateRange(startDate, endDate)
      reply.send(movements)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }
}