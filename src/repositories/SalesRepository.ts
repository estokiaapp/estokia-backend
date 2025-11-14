import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SalesFilters {
  startDate?: string
  endDate?: string
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  userId?: number
  limit?: number
  offset?: number
}

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

export class SalesRepository {
  async findMany(filters?: SalesFilters) {
    const where: any = {}

    if (filters?.startDate || filters?.endDate) {
      where.saleDate = {}
      if (filters.startDate) where.saleDate.gte = new Date(filters.startDate)
      if (filters.endDate) where.saleDate.lte = new Date(filters.endDate)
    }

    if (filters?.status) where.status = filters.status
    if (filters?.userId) where.userId = filters.userId

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          saleItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true
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
        orderBy: { saleDate: 'desc' },
        skip: filters?.offset || 0,
        take: filters?.limit || 20
      }),
      prisma.sale.count({ where })
    ])

    return { sales, total }
  }

  async findById(id: number) {
    return await prisma.sale.findUnique({
      where: { id },
      include: {
        saleItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
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
      }
    })
  }

  async create(saleData: CreateSaleData) {
    const saleNumber = `SALE-${Date.now()}`

    const saleItems = saleData.saleItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: Math.round(item.quantity * item.unitPrice * 100) / 100
    }))

    const totalAmount = Math.round(saleItems.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100

    return await prisma.sale.create({
      data: {
        saleNumber,
        userId: saleData.userId,
        totalAmount,
        status: 'PENDING',
        saleItems: {
          create: saleItems
        }
      },
      include: {
        saleItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            }
          }
        }
      }
    })
  }

  async updateStatus(id: number, status: 'PENDING' | 'COMPLETED' | 'CANCELLED') {
    return await prisma.sale.update({
      where: { id },
      data: { status },
      include: {
        saleItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            }
          }
        }
      }
    })
  }

  async getSalesReport(filters: {
    startDate: string
    endDate: string
    groupBy?: 'day' | 'week' | 'month'
    categoryId?: number
    supplierId?: number
  }) {
    const where: any = {
      saleDate: {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate)
      },
      status: 'COMPLETED'
    }

    if (filters.categoryId || filters.supplierId) {
      where.saleItems = {
        some: {
          product: {
            ...(filters.categoryId && { categoryId: filters.categoryId }),
            ...(filters.supplierId && { supplierId: filters.supplierId })
          }
        }
      }
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        saleItems: true
      },
      orderBy: { saleDate: 'asc' }
    })

    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const totalItems = sales.reduce((sum, sale) =>
      sum + sale.saleItems.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    )
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

    const groupedData = this.groupSalesByPeriod(sales, filters.groupBy || 'day')

    return {
      summary: {
        totalSales,
        totalRevenue,
        averageOrderValue,
        totalItems
      },
      data: groupedData
    }
  }

  private groupSalesByPeriod(sales: any[], groupBy: 'day' | 'week' | 'month') {
    const grouped = new Map()

    sales.forEach(sale => {
      const date = new Date(sale.saleDate)

      const period = (() => {
        switch (groupBy) {
          case 'day':
            return date.toISOString().split('T')[0]
          case 'week': {
            const startOfWeek = new Date(date)
            startOfWeek.setDate(date.getDate() - date.getDay())
            return startOfWeek.toISOString().split('T')[0]
          }
          case 'month':
            return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
          default:
            return date.toISOString().split('T')[0]
        }
      })()

      if (!grouped.has(period)) {
        grouped.set(period, {
          period,
          sales: 0,
          revenue: 0,
          items: 0
        })
      }

      const data = grouped.get(period)
      data.sales += 1
      data.revenue += sale.totalAmount
      data.items += sale.saleItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
    })

    return Array.from(grouped.values()).sort((a, b) => a.period.localeCompare(b.period))
  }
}