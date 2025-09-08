import type { FastifyInstance } from 'fastify'
import { UserController } from '../controllers/UserController.js'
import type { CreateUserRequest, UpdateUserRequest } from '../types/index.js'
import { GET_ALL_USERS_SCHEMA, GET_USER_SCHEMA, CREATE_USER_SCHEMA, UPDATE_USER_SCHEMA, DELETE_USER_SCHEMA } from '../dto/request/index.js'

interface UserParams {
  id: string
}

export async function userRoutes(fastify: FastifyInstance) {
  const userController = new UserController()

  fastify.get('/users', {
    schema: GET_ALL_USERS_SCHEMA
  }, userController.getAllUsers)

  fastify.get<{ Params: UserParams }>('/users/:id', {
    schema: GET_USER_SCHEMA
  }, userController.getUserById)

  fastify.post<{ Body: CreateUserRequest }>('/users', {
    schema: CREATE_USER_SCHEMA
  }, userController.createUser)

  fastify.put<{ Params: UserParams; Body: UpdateUserRequest }>('/users/:id', {
    preHandler: [fastify.authenticate],
    schema: UPDATE_USER_SCHEMA
  }, userController.updateUser)

  fastify.delete<{ Params: UserParams }>('/users/:id', {
    preHandler: [fastify.authenticate],
    schema: DELETE_USER_SCHEMA
  }, userController.deleteUser)
}