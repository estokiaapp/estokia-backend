import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import type { CreateUserRequest, UpdateUserRequest } from '../types/index.js'
import { hashPassword } from '../utils/auth.js'

const prisma = new PrismaClient()

interface UserParams {
  id: string
}

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/users', {
    schema: {
      description: 'Get all users',
      tags: ['users'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              email: { type: 'string' },
              name: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          posts: true
        }
      })
      return users
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch users' })
    }
  })

  fastify.get<{ Params: UserParams }>('/users/:id', {
    schema: {
      description: 'Get user by ID',
      tags: ['users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest<{ Params: UserParams }>, reply: FastifyReply) => {
    try {
      const userId = parseInt(request.params.id)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          posts: true
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
    schema: {
      description: 'Create a new user',
      tags: ['users'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          password: { type: 'string', minLength: 6 }
        }
      }
    }
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
    schema: {
      description: 'Update user by ID',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: UserParams; Body: UpdateUserRequest }>, reply: FastifyReply) => {
    try {
      const userId = parseInt(request.params.id)
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
    schema: {
      description: 'Delete user by ID',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest<{ Params: UserParams }>, reply: FastifyReply) => {
    try {
      const userId = parseInt(request.params.id)
      await prisma.user.delete({
        where: { id: userId }
      })
      reply.status(204).send()
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete user' })
    }
  })
}