import type { FastifyInstance } from 'fastify'
import { CategoryController } from '../controllers/CategoryController.js'
import { GET_ALL_CATEGORIES_SCHEMA, GET_CATEGORY_SCHEMA, CREATE_CATEGORY_SCHEMA, UPDATE_CATEGORY_SCHEMA, DELETE_CATEGORY_SCHEMA } from '../dto/request/index.js'

interface CategoryParams {
  id: string
}

export async function categoryRoutes(fastify: FastifyInstance) {
  const categoryController = new CategoryController()

  fastify.get('/categories', {
    schema: GET_ALL_CATEGORIES_SCHEMA
  }, categoryController.getAllCategories)

  fastify.get<{ Params: CategoryParams }>('/categories/:id', {
    schema: GET_CATEGORY_SCHEMA
  }, categoryController.getCategoryById)

  fastify.post('/categories', {
    preHandler: [fastify.authenticate],
    schema: CREATE_CATEGORY_SCHEMA
  }, categoryController.createCategory)

  fastify.put<{ Params: CategoryParams }>('/categories/:id', {
    preHandler: [fastify.authenticate],
    schema: UPDATE_CATEGORY_SCHEMA
  }, categoryController.updateCategory)

  fastify.delete<{ Params: CategoryParams }>('/categories/:id', {
    preHandler: [fastify.authenticate],
    schema: DELETE_CATEGORY_SCHEMA
  }, categoryController.deleteCategory)
}