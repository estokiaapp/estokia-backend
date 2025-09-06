import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import type { LoginRequest, LoginResponse } from '../types/index.js'
import { comparePassword } from '../utils/auth.js'
import { GET_CURRENT_USER, LOGIN_SCHEMA } from '../dto/request/index.ts'

const prisma = new PrismaClient()

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: LoginRequest }>('/auth/login', {
    schema: LOGIN_SCHEMA
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
          ...(user.name && { name: user.name })
        }
      }

      reply.send(response)
    } catch (error) {
      reply.status(500).send({ error: 'Internal server error', message: 'Login failed' })
    }
  })

  fastify.get('/auth/me', {
    preHandler: [fastify.authenticate],
    schema: GET_CURRENT_USER
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