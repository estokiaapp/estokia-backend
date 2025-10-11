import { SalesRepository } from '../repositories/SalesRepository.js'
import { StockMovementRepository } from '../repositories/StockMovementRepository.js'
import { ProductRepository } from '../repositories/ProductRepository.js'
import LogService from './LogService.js'

interface SaleItemData {
  productId: number
  quantity: number
  unitPrice: number
}

interface CreateSaleData {
  userId: number
  saleItems: SaleItemData[]
  customerInfo?: {
    name?: string
    email?: string
    phone?: string
  }
}

interface SalesFilters {
  startDate?: string
  endDate?: string
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  userId?: number
  limit?: number
  offset?: number
}

interface SalesReportFilters {
  startDate: string
  endDate: string
  groupBy?: 'day' | 'week' | 'month'
  categoryId?: number
  supplierId?: number
}

export class SalesService {
  private salesRepository = new SalesRepository()
  private stockMovementRepository = new StockMovementRepository()
  private productRepository = new ProductRepository()
  private logService = new LogService()

  async getAllSales(filters?: SalesFilters) {
    return await this.salesRepository.findMany(filters)
  }

  async getSaleById(id: number) {
    const sale = await this.salesRepository.findById(id)
    if (!sale) {
      throw new Error('Sale not found')
    }
    return sale
  }

  async createSale(saleData: CreateSaleData, userName?: string) {
    try {
      await this.validateSaleItems(saleData.saleItems)

      const sale = await this.salesRepository.create(saleData)

      // Log sale creation
      await this.logService.logSale('CREATE', {
        saleId: sale.id,
        saleNumber: sale.saleNumber,
        totalAmount: sale.totalAmount,
        status: sale.status,
        items: saleData.saleItems,
      }, saleData.userId, userName)

      return sale
    } catch (error) {
      await this.logService.logError(error as Error, {
        operation: 'createSale',
        eventType: 'DATABASE_ERROR',
        userId: saleData.userId,
      })
      throw error
    }
  }

  async updateSaleStatus(id: number, status: 'PENDING' | 'COMPLETED' | 'CANCELLED', userId?: number, userName?: string) {
    try {
      const existingSale = await this.salesRepository.findById(id)
      if (!existingSale) {
        throw new Error('Sale not found')
      }

      if (existingSale.status === status) {
        throw new Error(`Sale is already ${status}`)
      }

      if (status === 'COMPLETED' && existingSale.status === 'PENDING') {
        await this.processSaleCompletion(existingSale)
      } else if (status === 'CANCELLED' && existingSale.status === 'COMPLETED') {
        await this.processSaleCancellation(existingSale)
      }

      const updatedSale = await this.salesRepository.updateStatus(id, status)

      // Log status change
      const eventTypeMap: Record<string, any> = {
        COMPLETED: 'SALE_COMPLETED',
        CANCELLED: 'SALE_CANCELLED',
        PENDING: 'SALE_UPDATED',
      }

      await this.logService.log({
        timestamp: new Date(),
        eventType: eventTypeMap[status] || 'SALE_UPDATED',
        action: status === 'COMPLETED' ? 'COMPLETE' : status === 'CANCELLED' ? 'CANCEL' : 'UPDATE',
        userId,
        userName,
        resourceType: 'SALE',
        resourceId: id,
        description: `Sale ${existingSale.saleNumber} ${status.toLowerCase()}`,
        metadata: {
          saleNumber: existingSale.saleNumber,
          totalAmount: existingSale.totalAmount,
          previousStatus: existingSale.status,
          newStatus: status,
        },
        severity: 'INFO',
      })

      return updatedSale
    } catch (error) {
      await this.logService.logError(error as Error, {
        operation: 'updateSaleStatus',
        eventType: 'DATABASE_ERROR',
        saleId: id,
        userId,
      })
      throw error
    }
  }

  async getSalesReport(filters: SalesReportFilters) {
    return await this.salesRepository.getSalesReport(filters)
  }

  private async validateSaleItems(saleItems: SaleItemData[]) {
    for (const item of saleItems) {
      const product = await this.productRepository.findById(item.productId)
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`)
      }

      if (!product.active) {
        throw new Error(`Product ${product.name} is not active`)
      }

      if (item.quantity <= 0) {
        throw new Error('Quantity must be greater than 0')
      }

      if (item.unitPrice < 0) {
        throw new Error('Unit price cannot be negative')
      }
    }
  }

  private async processSaleCompletion(sale: any) {
    for (const saleItem of sale.saleItems) {
      const product = await this.productRepository.findById(saleItem.productId)
      if (!product) {
        throw new Error(`Product with ID ${saleItem.productId} not found`)
      }

      if (product.currentStock < saleItem.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.currentStock}, Required: ${saleItem.quantity}`)
      }

      await this.stockMovementRepository.create({
        productId: saleItem.productId,
        userId: sale.userId,
        type: 'OUT',
        quantity: saleItem.quantity,
        unitPrice: saleItem.unitPrice,
        reason: 'Sale completion',
        notes: `Sale #${sale.saleNumber}`
      })
    }
  }

  private async processSaleCancellation(sale: any) {
    for (const saleItem of sale.saleItems) {
      await this.stockMovementRepository.create({
        productId: saleItem.productId,
        userId: sale.userId,
        type: 'IN',
        quantity: saleItem.quantity,
        unitPrice: saleItem.unitPrice,
        reason: 'Sale cancellation',
        notes: `Sale #${sale.saleNumber} cancelled`
      })
    }
  }

  async getTopSellingProducts(filters: {
    startDate?: string
    endDate?: string
    limit?: number
  }) {
    const where: any = {
      sale: {
        status: 'COMPLETED'
      }
    }

    if (filters.startDate || filters.endDate) {
      where.sale.saleDate = {}
      if (filters.startDate) where.sale.saleDate.gte = new Date(filters.startDate)
      if (filters.endDate) where.sale.saleDate.lte = new Date(filters.endDate)
    }

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      where,
      _sum: {
        quantity: true,
        subtotal: true
      },
      _count: {
        _all: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: filters.limit || 10
    })

    const enrichedProducts = await Promise.all(
      topProducts.map(async (item: any) => {
        const product = await this.productRepository.findById(item.productId)
        return {
          product: {
            id: product?.id,
            name: product?.name,
            sku: product?.sku
          },
          totalQuantitySold: item._sum.quantity || 0,
          totalRevenue: item._sum.subtotal || 0,
          totalTransactions: item._count._all
        }
      })
    )

    await prisma.$disconnect()
    return enrichedProducts
  }

  async getSalesByPeriod(filters: {
    startDate: string
    endDate: string
    groupBy?: 'day' | 'week' | 'month'
  }) {
    return await this.salesRepository.getSalesReport({
      startDate: filters.startDate,
      endDate: filters.endDate,
      groupBy: filters.groupBy || 'day'
    })
  }
}