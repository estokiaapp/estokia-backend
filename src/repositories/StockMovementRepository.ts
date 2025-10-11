import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface StockMovementFilters {
  productId?: number
  startDate?: string
  endDate?: string
  type?: 'IN' | 'OUT' | 'ADJUSTMENT'
  userId?: number
  limit?: number
  offset?: number
}

interface CreateStockMovementData {
  productId: number
  userId: number
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  unitPrice?: number
  reason?: string
  notes?: string
}

interface InventoryReportFilters {
  categoryId?: number
  supplierId?: number
  lowStockOnly?: boolean
  includeInactive?: boolean
}

export class StockMovementRepository {
  async findMany(filters?: StockMovementFilters) {
    const where: any = {}

    if (filters?.productId) where.productId = filters.productId
    if (filters?.type) where.type = filters.type
    if (filters?.userId) where.userId = filters.userId

    if (filters?.startDate || filters?.endDate) {
      where.movementDate = {}
      if (filters.startDate) where.movementDate.gte = new Date(filters.startDate)
      if (filters.endDate) where.movementDate.lte = new Date(filters.endDate)
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              currentStock: true
            }
          },
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { movementDate: 'desc' },
        skip: filters?.offset || 0,
        take: filters?.limit || 50
      }),
      prisma.stockMovement.count({ where })
    ])

    return { movements, total }
  }

  async findByProductId(productId: number, filters?: Omit<StockMovementFilters, 'productId'>) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        sku: true,
        currentStock: true
      }
    })

    if (!product) {
      throw new Error('Product not found')
    }

    const { movements, total } = await this.findMany({
      ...filters,
      productId
    })

    return { product, movements, total }
  }

  async create(movementData: CreateStockMovementData) {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: movementData.productId }
      })

      if (!product) {
        throw new Error('Product not found')
      }

      let newStock = product.currentStock

      if (movementData.type === 'IN' || movementData.type === 'ADJUSTMENT') {
        newStock += movementData.quantity
      } else if (movementData.type === 'OUT') {
        newStock -= movementData.quantity
      }

      if (newStock < 0) {
        throw new Error('Insufficient stock')
      }

      const movement = await tx.stockMovement.create({
        data: {
          productId: movementData.productId,
          userId: movementData.userId,
          type: movementData.type,
          quantity: Math.abs(movementData.quantity),
          ...(movementData.unitPrice !== undefined && { unitPrice: movementData.unitPrice }),
          ...(movementData.reason !== undefined && { reason: movementData.reason }),
          ...(movementData.notes !== undefined && { notes: movementData.notes })
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true
            }
          },
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      const updatedProduct = await tx.product.update({
        where: { id: movementData.productId },
        data: { currentStock: newStock }
      })

      return {
        movement,
        product: updatedProduct
      }
    })
  }

  async createBulk(movements: CreateStockMovementData[]) {
    const results: Array<{
      productId: number
      success: boolean
      currentStock?: number
      error?: string
    }> = []

    for (const movementData of movements) {
      try {
        const result = await this.create(movementData)
        results.push({
          productId: movementData.productId,
          success: true,
          currentStock: result.product.currentStock
        })
      } catch (error: any) {
        results.push({
          productId: movementData.productId,
          success: false,
          error: error.message
        })
      }
    }

    const processed = results.length
    const successCount = results.filter(r => r.success).length

    return {
      success: successCount === processed,
      processed,
      results
    }
  }

  async getInventoryReport(filters?: InventoryReportFilters) {
    const where: any = {
      active: filters?.includeInactive ? undefined : true
    }

    if (filters?.categoryId) where.categoryId = filters.categoryId
    if (filters?.supplierId) where.supplierId = filters.supplierId

    if (filters?.lowStockOnly) {
      where.OR = [
        { currentStock: { lte: prisma.product.fields.minimumStock } },
        { currentStock: 0 }
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        supplier: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { currentStock: 'asc' },
        { name: 'asc' }
      ]
    })

    const enrichedProducts = products.map(product => {
      const stockValue = (product.costPrice || 0) * product.currentStock
      const isLowStock = product.currentStock <= product.minimumStock
      const isOutOfStock = product.currentStock === 0

      return {
        ...product,
        stockValue,
        isLowStock,
        isOutOfStock
      }
    })

    const summary = {
      totalProducts: products.length,
      totalValue: enrichedProducts.reduce((sum, p) => sum + p.stockValue, 0),
      lowStockProducts: enrichedProducts.filter(p => p.isLowStock && !p.isOutOfStock).length,
      outOfStockProducts: enrichedProducts.filter(p => p.isOutOfStock).length
    }

    return {
      summary,
      products: enrichedProducts
    }
  }

  async getStockMovementsByDateRange(startDate: string, endDate: string) {
    return await prisma.stockMovement.findMany({
      where: {
        movementDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { movementDate: 'desc' }
    })
  }

  async getLowStockProducts() {
    return await prisma.product.findMany({
      where: {
        active: true,
        currentStock: {
          lte: prisma.product.fields.minimumStock
        }
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { currentStock: 'asc' }
    })
  }
}