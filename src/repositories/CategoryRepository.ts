import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class CategoryRepository {
  async findMany() {
    return await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { products: true }
        }
      }
    })
  }

  async findById(id: number) {
    return await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { products: true }
        }
      }
    })
  }

  async findByName(name: string) {
    return await prisma.category.findUnique({
      where: { name }
    })
  }

  async create(categoryData: any) {
    return await prisma.category.create({
      data: categoryData,
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true
      }
    })
  }

  async update(id: number, categoryData: any) {
    return await prisma.category.update({
      where: { id },
      data: categoryData,
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true
      }
    })
  }

  async delete(id: number) {
    await prisma.category.delete({
      where: { id }
    })
  }
}