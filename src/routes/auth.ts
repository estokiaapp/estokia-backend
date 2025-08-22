import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import type { LoginRequest, LoginResponse } from '../types/index.js'
import { comparePassword } from '../utils/auth.js'

const prisma = new PrismaClient()

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: LoginRequest }>('/auth/login', {
    schema: {
      description: 'Login with email and password',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                email: { type: 'string' },
                name: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
    try {
      const { email, password } = request.body

      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        return reply.status(401).send({ 
          error: 'Authentication failed', 
          message: 'Invalid email or password' 
        })
      }

      const isValidPassword = await comparePassword(password, user.password)

      if (!isValidPassword) {
        return reply.status(401).send({ 
          error: 'Authentication failed', 
          message: 'Invalid email or password' 
        })
      }

      const token = await reply.jwtSign({ 
        userId: user.id, 
        email: user.email 
      })

      const response: LoginResponse = {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || undefined
        }
      }

      reply.send(response)
    } catch (error) {
      reply.status(500).send({ error: 'Internal server error', message: 'Login failed' })
    }
  })

  fastify.get('/auth/me', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get current user profile',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
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
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      const user = await prisma.user.findUnique({
        where: { id: request.user.userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
        }
      })

      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }

      reply.send(user)
    } catch (error) {
      reply.status(500).send({ error: 'Internal server error' })
    }
  })
}