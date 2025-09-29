import { StockMovementRepository } from '../repositories/StockMovementRepository.js'
import { ProductRepository } from '../repositories/ProductRepository.js'

interface StockAdjustmentData {
  productId: string
  userId: number
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  unitPrice?: number
  reason?: string
  notes?: string
}

interface BulkStockAdjustmentData {
  adjustments: StockAdjustmentData[]
}

interface StockHistoryFilters {
  startDate?: string
  endDate?: string
  type?: 'IN' | 'OUT' | 'ADJUSTMENT'
  userId?: number
  limit?: number
  offset?: number
}

interface InventoryReportFilters {
  categoryId?: string
  supplierId?: string
  lowStockOnly?: boolean
  includeInactive?: boolean
}

export class StockService {
  private stockMovementRepository = new StockMovementRepository()
  private productRepository = new ProductRepository()

  async adjustStock(productId: string, adjustmentData: Omit<StockAdjustmentData, 'productId'>) {
    const product = await this.productRepository.findById(productId)
    if (!product) {
      throw new Error('Product not found')
    }

    if (!product.active) {
      throw new Error('Cannot adjust stock for inactive product')
    }

    if (adjustmentData.quantity === 0) {
      throw new Error('Quantity cannot be zero')
    }

    if (adjustmentData.type === 'OUT' && product.currentStock < Math.abs(adjustmentData.quantity)) {
      throw new Error(`Insufficient stock. Available: ${product.currentStock}, Requested: ${Math.abs(adjustmentData.quantity)}`)
    }

    const result = await this.stockMovementRepository.create({
      productId,
      ...adjustmentData
    })

    await this.checkLowStockAlert(productId)

    return {
      id: product.id,
      currentStock: result.product.currentStock,
      movement: result.movement
    }
  }

  async bulkAdjustStock(bulkData: BulkStockAdjustmentData) {
    const results = await this.stockMovementRepository.createBulk(bulkData.adjustments)

    for (const adjustment of bulkData.adjustments) {
      if (results.results.find(r => r.productId === adjustment.productId && r.success)) {
        await this.checkLowStockAlert(adjustment.productId)
      }
    }

    return results
  }

  async getStockHistory(productId: string, filters?: StockHistoryFilters) {
    return await this.stockMovementRepository.findByProductId(productId, filters)
  }

  async getAllStockMovements(filters?: StockHistoryFilters) {
    return await this.stockMovementRepository.findMany(filters)
  }

  async getInventoryReport(filters?: InventoryReportFilters) {
    return await this.stockMovementRepository.getInventoryReport(filters)
  }

  async getLowStockProducts() {
    return await this.stockMovementRepository.getLowStockProducts()
  }

  async getStockMovementsByDateRange(startDate: string, endDate: string) {
    return await this.stockMovementRepository.getStockMovementsByDateRange(startDate, endDate)
  }

  async updateStockLimits(productId: string, limits: {
    minimumStock?: number
    maximumStock?: number
  }) {
    const product = await this.productRepository.findById(productId)
    if (!product) {
      throw new Error('Product not found')
    }

    if (limits.minimumStock !== undefined && limits.minimumStock < 0) {
      throw new Error('Minimum stock cannot be negative')
    }

    if (limits.maximumStock !== undefined && limits.minimumStock !== undefined) {
      if (limits.maximumStock < limits.minimumStock) {
        throw new Error('Maximum stock cannot be less than minimum stock')
      }
    }

    const updatedProduct = await this.productRepository.update(productId, {
      minimumStock: limits.minimumStock,
      maximumStock: limits.maximumStock
    })

    await this.checkLowStockAlert(productId)

    return updatedProduct
  }

  async getStockValueReport(filters?: {
    categoryId?: string
    supplierId?: string
  }) {
    const inventoryData = await this.stockMovementRepository.getInventoryReport({
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.supplierId && { supplierId: filters.supplierId }),
      includeInactive: false
    })

    const stockValueByCategory = new Map<string, number>()
    const stockValueBySupplier = new Map<string, number>()

    inventoryData.products.forEach((product: any) => {
      const stockValue = product.stockValue

      if (product.category) {
        const categoryValue = stockValueByCategory.get(product.category.name) || 0
        stockValueByCategory.set(product.category.name, categoryValue + stockValue)
      }

      if (product.supplier) {
        const supplierValue = stockValueBySupplier.get(product.supplier.name) || 0
        stockValueBySupplier.set(product.supplier.name, supplierValue + stockValue)
      }
    })

    return {
      totalValue: inventoryData.summary.totalValue,
      byCategory: Array.from(stockValueByCategory.entries()).map(([name, value]) => ({
        name,
        value
      })),
      bySupplier: Array.from(stockValueBySupplier.entries()).map(([name, value]) => ({
        name,
        value
      })),
      lowValueProducts: inventoryData.products
        .filter((p: any) => p.stockValue < 100)
        .sort((a: any, b: any) => a.stockValue - b.stockValue)
        .slice(0, 10),
      highValueProducts: inventoryData.products
        .sort((a: any, b: any) => b.stockValue - a.stockValue)
        .slice(0, 10)
    }
  }

  private async checkLowStockAlert(productId: string) {
    const product = await this.productRepository.findById(productId)
    if (!product) return

    if (product.currentStock <= product.minimumStock) {
      await this.createLowStockAlert(product)
    }
  }

  private async createLowStockAlert(product: any) {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const existingAlert = await prisma.alert.findFirst({
      where: {
        productId: product.id,
        type: 'LOW_STOCK',
        read: false
      }
    })

    if (!existingAlert) {
      await prisma.alert.create({
        data: {
          productId: product.id,
          type: 'LOW_STOCK',
          title: 'Low Stock Alert',
          message: `Product ${product.name} (${product.sku}) is running low. Current stock: ${product.currentStock}, Minimum: ${product.minimumStock}`,
          priority: product.currentStock === 0 ? 'CRITICAL' : 'HIGH'
        }
      })
    }

    await prisma.$disconnect()
  }

  async getStockTrends(productId: string, days: number = 30) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    const movements = await this.stockMovementRepository.findMany({
      productId,
      ...(startDate && { startDate: startDate.toISOString().split('T')[0] }),
      ...(endDate && { endDate: endDate.toISOString().split('T')[0] }),
      limit: 1000
    })

    const dailyData = new Map<string, {
      date: string
      stockIn: number
      stockOut: number
      adjustments: number
      endingStock: number
    }>()

    const product = await this.productRepository.findById(productId)
    let currentStock = product?.currentStock || 0

    movements.movements.reverse().forEach((movement: any) => {
      const date = movement.movementDate.toISOString().split('T')[0]

      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          stockIn: 0,
          stockOut: 0,
          adjustments: 0,
          endingStock: currentStock
        })
      }

      const dayData = dailyData.get(date)!

      if (movement.type === 'IN') {
        dayData.stockIn += movement.quantity
      } else if (movement.type === 'OUT') {
        dayData.stockOut += movement.quantity
      } else if (movement.type === 'ADJUSTMENT') {
        dayData.adjustments += movement.quantity
      }
    })

    return Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date))
  }
}