import type { FastifyRequest, FastifyReply } from 'fastify'
import { SalesService } from '../services/SalesService.js'

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

interface ParsedSalesReportQuery {
  startDate: string
  endDate: string
  groupBy?: 'day' | 'week' | 'month'
  categoryId?: number
  supplierId?: number
}

interface CreateSaleBody {
  saleItems: Array<{
    productId: number
    quantity: number
    unitPrice: number
  }>
  customerInfo?: {
    name?: string
    email?: string
    phone?: string
  }
}

interface UpdateSaleStatusBody {
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
}

export class SalesController {
  private salesService = new SalesService()

  getAllSales = async (request: FastifyRequest<{ Querystring: SalesQuery }>, reply: FastifyReply) => {
    try {
      const filters: any = {
        ...(request.query.startDate && { startDate: request.query.startDate }),
        ...(request.query.endDate && { endDate: request.query.endDate }),
        ...(request.query.status && { status: request.query.status }),
        ...(request.query.userId && { userId: request.query.userId }),
        limit: request.query.limit || 20,
        offset: request.query.offset || 0
      }

      const result = await this.salesService.getAllSales(filters)
      reply.send(result)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }

  getSaleById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const id = parseInt(request.params.id, 10)
      if (isNaN(id) || id < 1) {
        return reply.status(400).send({ error: 'Invalid ID format. Must be a positive integer.' })
      }

      const sale = await this.salesService.getSaleById(id)
      reply.send(sale)
    } catch (error: any) {
      if (error.message === 'Sale not found') {
        reply.status(404).send({ error: error.message })
      } else {
        reply.status(500).send({ error: error.message })
      }
    }
  }

  createSale = async (request: FastifyRequest<{ Body: CreateSaleBody }>, reply: FastifyReply) => {
    try {
      const userId = (request as any).user?.id
      if (!userId) {
        return reply.status(401).send({ error: 'Authentication required' })
      }

      const saleData = {
        userId,
        saleItems: request.body.saleItems,
        ...(request.body.customerInfo !== undefined && { customerInfo: request.body.customerInfo })
      }

      const sale = await this.salesService.createSale(saleData)
      reply.status(201).send(sale)
    } catch (error: any) {
      if (error.message.includes('not found') || error.message.includes('not active')) {
        reply.status(400).send({ error: error.message })
      } else {
        reply.status(500).send({ error: error.message })
      }
    }
  }

  updateSaleStatus = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateSaleStatusBody }>,
    reply: FastifyReply
  ) => {
    try {
      const id = parseInt(request.params.id, 10)
      if (isNaN(id) || id < 1) {
        return reply.status(400).send({ error: 'Invalid ID format. Must be a positive integer.' })
      }

      const { status } = request.body

      const sale = await this.salesService.updateSaleStatus(id, status)
      reply.send(sale)
    } catch (error: any) {
      if (error.message === 'Sale not found') {
        reply.status(404).send({ error: error.message })
      } else if (error.message.includes('already') || error.message.includes('Insufficient stock')) {
        reply.status(400).send({ error: error.message })
      } else {
        reply.status(500).send({ error: error.message })
      }
    }
  }

  getSalesReport = async (request: FastifyRequest<{ Querystring: SalesReportQuery }>, reply: FastifyReply) => {
    try {
      const filters: ParsedSalesReportQuery = {
        startDate: request.query.startDate,
        endDate: request.query.endDate,
        groupBy: request.query.groupBy || 'day'
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

      const report = await this.salesService.getSalesReport(filters)
      reply.send(report)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }

  getTopSellingProducts = async (
    request: FastifyRequest<{
      Querystring: {
        startDate?: string
        endDate?: string
        limit?: number
      }
    }>,
    reply: FastifyReply
  ) => {
    try {
      const filters = {
        ...(request.query.startDate !== undefined && { startDate: request.query.startDate }),
        ...(request.query.endDate !== undefined && { endDate: request.query.endDate }),
        limit: request.query.limit || 10
      }

      const topProducts = await this.salesService.getTopSellingProducts(filters)
      reply.send(topProducts)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }

  getSalesByPeriod = async (
    request: FastifyRequest<{
      Querystring: {
        startDate: string
        endDate: string
        groupBy?: 'day' | 'week' | 'month'
      }
    }>,
    reply: FastifyReply
  ) => {
    try {
      const filters = {
        startDate: request.query.startDate,
        endDate: request.query.endDate,
        groupBy: request.query.groupBy || 'day'
      }

      const salesData = await this.salesService.getSalesByPeriod(filters)
      reply.send(salesData)
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  }
}