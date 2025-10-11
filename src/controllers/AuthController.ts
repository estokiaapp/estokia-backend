import type { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from '../services/AuthService.js'
import LogService from '../services/LogService.js'

export class AuthController {
  private authService = new AuthService()
  private logService = new LogService()

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    const requestBody = request.body as any
    try {
      const user = await this.authService.login(requestBody)

      if (!user) {
        // Log failed authentication attempt
        await this.logService.logUserAction(
          'AUTHENTICATION_FAILED',
          'LOGIN',
          {
            description: 'Failed login attempt',
            email: requestBody.email,
          },
          undefined,
          undefined
        )

        return reply.status(401).send({
          error: 'Authentication failed',
          message: 'Invalid email or password'
        })
      }

      const token = await reply.jwtSign({
        userId: user.id.toString(),
        email: user.email
      })

      // Log successful login
      await this.logService.logUserAction(
        'USER_LOGIN',
        'LOGIN',
        {
          id: user.id,
          email: user.email,
          description: 'User logged in successfully',
        },
        user.id,
        user.name || undefined
      )

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
      await this.logService.logError(error as Error, {
        operation: 'login',
        eventType: 'API_ERROR',
        email: requestBody.email,
      })
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