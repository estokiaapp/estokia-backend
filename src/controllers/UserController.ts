import type { FastifyRequest, FastifyReply } from 'fastify'
import { UserService } from '../services/UserService.js'

export class UserController {
  private userService = new UserService()

  getAllUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const users = await this.userService.getAllUsers()
      reply.send(users)
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch users' })
    }
  }

  getUserById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const user = await this.userService.getUserById(request.params.id)
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }
      
      reply.send(user)
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch user' })
    }
  }

  createUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await this.userService.createUser(request.body)
      reply.status(201).send(user)
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        reply.status(409).send({ error: error.message })
      } else {
        reply.status(400).send({ error: error.message })
      }
    }
  }

  updateUser = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const user = await this.userService.updateUser(request.params.id, request.body)
      reply.send(user)
    } catch (error: any) {
      if (error.message === 'User not found') {
        reply.status(404).send({ error: error.message })
      } else if (error.message.includes('already in use')) {
        reply.status(409).send({ error: error.message })
      } else {
        reply.status(400).send({ error: error.message })
      }
    }
  }

  deleteUser = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      await this.userService.deleteUser(request.params.id)
      reply.status(204).send()
    } catch (error: any) {
      if (error.message === 'User not found') {
        reply.status(404).send({ error: error.message })
      } else {
        reply.status(400).send({ error: error.message })
      }
    }
  }
}