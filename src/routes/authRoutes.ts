import type { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/AuthController.js'
import type { LoginRequest } from '../types/index.js'
import { GET_CURRENT_USER, LOGIN_SCHEMA } from '../dto/request/index.js'

export async function authRoutes(fastify: FastifyInstance) {
  const authController = new AuthController()

  fastify.post<{ Body: LoginRequest }>('/auth/login', {
    schema: LOGIN_SCHEMA
  }, authController.login)

  fastify.get('/auth/me', {
    preHandler: [fastify.authenticate],
    schema: GET_CURRENT_USER
  }, authController.getCurrentUser)
}