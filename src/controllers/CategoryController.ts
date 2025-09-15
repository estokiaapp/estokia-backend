import type { FastifyRequest, FastifyReply } from 'fastify'
import { CategoryService } from '../services/CategoryService.js'

export class CategoryController {
  private categoryService = new CategoryService()

  getAllCategories = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const categories = await this.categoryService.getAllCategories()
      reply.send(categories)
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch categories' })
    }
  }

  getCategoryById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const category = await this.categoryService.getCategoryById(request.params.id)

      if (!category) {
        return reply.status(404).send({ error: 'Category not found' })
      }

      reply.send(category)
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch category' })
    }
  }

  createCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const category = await this.categoryService.createCategory(request.body)
      reply.status(201).send(category)
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        reply.status(409).send({ error: error.message })
      } else {
        reply.status(400).send({ error: error.message })
      }
    }
  }

  updateCategory = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const category = await this.categoryService.updateCategory(request.params.id, request.body)
      reply.send(category)
    } catch (error: any) {
      if (error.message === 'Category not found') {
        reply.status(404).send({ error: error.message })
      } else if (error.message.includes('already in use')) {
        reply.status(409).send({ error: error.message })
      } else {
        reply.status(400).send({ error: error.message })
      }
    }
  }

  deleteCategory = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      await this.categoryService.deleteCategory(request.params.id)
      reply.status(204).send()
    } catch (error: any) {
      if (error.message === 'Category not found') {
        reply.status(404).send({ error: error.message })
      } else {
        reply.status(400).send({ error: error.message })
      }
    }
  }
}