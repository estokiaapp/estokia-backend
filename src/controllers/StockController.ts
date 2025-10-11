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
    productId: number
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

interface ParsedInventoryReportQuery {
  categoryId?: number
  supplierId?: number
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

      const id = parseInt(request.params.id, 10)
      if (isNaN(id) || id < 1) {
        return reply.status(400).send({ error: 'Invalid ID format. Must be a positive integer.' })
      }

      const adjustmentData = {
        userId,
        type: request.body.type,
        quantity: request.body.quantity,
        ...(request.body.unitPrice !== undefined && { unitPrice: request.body.unitPrice }),
        ...(request.body.reason !== undefined && { reason: request.body.reason }),
        ...(request.body.notes !== undefined && { notes: request.body.notes })
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
      const id = parseInt(request.params.id, 10)
      if (isNaN(id) || id < 1) {
        return reply.status(400).send({ error: 'Invalid ID format. Must be a positive integer.' })
      }

      const filters = {
        ...(request.query.startDate !== undefined && { startDate: request.query.startDate }),
        ...(request.query.endDate !== undefined && { endDate: request.query.endDate }),
        ...(request.query.type !== undefined && { type: request.query.type }),
        ...(request.query.userId !== undefined && { userId: request.query.userId }),
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
        ...(request.query.startDate !== undefined && { startDate: request.query.startDate }),
        ...(request.query.endDate !== undefined && { endDate: request.query.endDate }),
        ...(request.query.type !== undefined && { type: request.query.type }),
        ...(request.query.userId !== undefined && { userId: request.query.userId }),
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
      const filters: ParsedInventoryReportQuery = {
        lowStockOnly: request.query.lowStockOnly || false,
        includeInactive: request.query.includeInactive || false
      }

      if (request.query.categoryId) {
        const categoryId = parseInt(request.query.categoryId, 10)
        if (isNaN(categoryId) || categoryId < 1) {
          return reply.status(400).send({ error: 'Invalid categoryId format. Must be a positive integer.' })
        }
        filters.categoryId = categoryId
      }

      if (request.query.supplierId) {
        const supplierId = parseInt(request.query.supplierId, 10)
        if (isNaN(supplierId) || supplierId < 1) {
          return reply.status(400).send({ error: 'Invalid supplierId format. Must be a positive integer.' })
        }
        filters.supplierId = supplierId
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
      const id = parseInt(request.params.id, 10)
      if (isNaN(id) || id < 1) {
        return reply.status(400).send({ error: 'Invalid ID format. Must be a positive integer.' })
      }

      const limits = {
        ...(request.body.minimumStock !== undefined && { minimumStock: request.body.minimumStock }),
        ...(request.body.maximumStock !== undefined && { maximumStock: request.body.maximumStock })
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
      const filters: { categoryId?: number; supplierId?: number } = {}

      if (request.query.categoryId) {
        const categoryId = parseInt(request.query.categoryId, 10)
        if (isNaN(categoryId) || categoryId < 1) {
          return reply.status(400).send({ error: 'Invalid categoryId format. Must be a positive integer.' })
        }
        filters.categoryId = categoryId
      }

      if (request.query.supplierId) {
        const supplierId = parseInt(request.query.supplierId, 10)
        if (isNaN(supplierId) || supplierId < 1) {
          return reply.status(400).send({ error: 'Invalid supplierId format. Must be a positive integer.' })
        }
        filters.supplierId = supplierId
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
      const id = parseInt(request.params.id, 10)
      if (isNaN(id) || id < 1) {
        return reply.status(400).send({ error: 'Invalid ID format. Must be a positive integer.' })
      }

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