import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import type { CreateUserRequest, UpdateUserRequest } from '../types/index.js'
import { hashPassword } from '../utils/auth.js'
import { GET_ALL_USERS_SCHEMA, GET_USER_SCHEMA, CREATE_USER_SCHEMA, UPDATE_USER_SCHEMA, DELETE_USER_SCHEMA } from '../dto/request/index.ts'


const prisma = new PrismaClient()

interface UserParams {
  id: string
}

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/users', {
    schema: GET_ALL_USERS_SCHEMA
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        }
      })
      return users
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch users' })
    }
  })

  fastify.get<{ Params: UserParams }>('/users/:id', {
    schema: GET_USER_SCHEMA
  }, async (request: FastifyRequest<{ Params: UserParams }>, reply: FastifyReply) => {
    try {
      const userId = request.params.id
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        }
      })
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }
      
      return user
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch user' })
    }
  })

  fastify.post<{ Body: CreateUserRequest }>('/users', {
    schema: CREATE_USER_SCHEMA
  }, async (request: FastifyRequest<{ Body: CreateUserRequest }>, reply: FastifyReply) => {
    try {
      const { password, ...userData } = request.body
      const hashedPassword = await hashPassword(password)
      
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
        }
      })
      reply.status(201).send(user)
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create user' })
    }
  })

  fastify.put<{ Params: UserParams; Body: UpdateUserRequest }>('/users/:id', {
    preHandler: [fastify.authenticate],
    schema: UPDATE_USER_SCHEMA
  }, async (request: FastifyRequest<{ Params: UserParams; Body: UpdateUserRequest }>, reply: FastifyReply) => {
    try {
      const userId = request.params.id
      const user = await prisma.user.update({
        where: { id: userId },
        data: request.body
      })
      return user
    } catch (error) {
      reply.status(500).send({ error: 'Failed to update user' })
    }
  })

  fastify.delete<{ Params: UserParams }>('/users/:id', {
    preHandler: [fastify.authenticate],
    schema: DELETE_USER_SCHEMA
  }, async (request: FastifyRequest<{ Params: UserParams }>, reply: FastifyReply) => {
    try {
      const userId = request.params.id
      await prisma.user.delete({
        where: { id: userId }
      })
      reply.status(204).send()
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete user' })
    }
  })
}