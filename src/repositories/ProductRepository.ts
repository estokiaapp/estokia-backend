import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ProductFilters {
  categoryId?: number
  supplierId?: number
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}

export class ProductRepository {
  async findMany(filters?: ProductFilters) {
    const where: any = {}

    if (filters?.categoryId) where.categoryId = filters.categoryId
    if (filters?.supplierId) where.supplierId = filters.supplierId
    if (filters?.minPrice) where.sellingPrice = { gte: filters.minPrice }
    if (filters?.maxPrice) where.sellingPrice = { ...where.sellingPrice, lte: filters.maxPrice }
    if (filters?.inStock !== undefined) where.currentStock = filters.inStock ? { gt: 0 } : { lte: 0 }

    return await prisma.product.findMany({ where })
  }

  async findById(id: number) {
    return await prisma.product.findUnique({
      where: { id }
    })
  }

  async findBySku(sku: string) {
    return await prisma.product.findUnique({
      where: { sku }
    })
  }

  async create(productData: any) {
    return await prisma.product.create({
      data: productData
    })
  }

  async update(id: number, productData: any) {
    return await prisma.product.update({
      where: { id },
      data: productData
    })
  }

  async delete(id: number) {
    await prisma.product.delete({
      where: { id }
    })
  }
}