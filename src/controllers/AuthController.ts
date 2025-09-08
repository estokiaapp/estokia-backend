import type { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from '../services/AuthService.js'

export class AuthController {
  private authService = new AuthService()

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await this.authService.login(request.body)

      if (!user) {
        return reply.status(401).send({ 
          error: 'Authentication failed', 
          message: 'Invalid email or password' 
        })
      }

      const token = await reply.jwtSign({ 
        userId: user.id, 
        email: user.email 
      })

      const response = {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }

      reply.send(response)
    } catch (error: any) {
      reply.status(400).send({ error: error.message })
    }
  }

  getCurrentUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      const user = await this.authService.getCurrentUser(request.user.userId)

      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }

      reply.send(user)
    } catch (error: any) {
      reply.status(400).send({ error: error.message })
    }
  }
}