import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class UserRepository {
  async findMany() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    })
  }

  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    })
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    })
  }

  async create(userData: any) {
    return await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    })
  }

  async update(id: string, userData: any) {
    return await prisma.user.update({
      where: { id },
      data: userData
    })
  }

  async delete(id: string) {
    await prisma.user.delete({
      where: { id }
    })
  }
}