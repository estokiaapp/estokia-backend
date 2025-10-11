import type { FastifyRequest, FastifyReply } from 'fastify'
import { ProductService } from '../services/ProductService.js'

interface ProductQuery {
  categoryId?: string
  supplierId?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}

interface ParsedProductQuery {
  categoryId?: number
  supplierId?: number
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}

export class ProductController {
  private productService = new ProductService()

  getAllProducts = async (request: FastifyRequest<{ Querystring: ProductQuery }>, reply: FastifyReply) => {
    try {
      const filters: ParsedProductQuery = {
        ...(request.query.minPrice !== undefined && { minPrice: request.query.minPrice }),
        ...(request.query.maxPrice !== undefined && { maxPrice: request.query.maxPrice }),
        ...(request.query.inStock !== undefined && { inStock: request.query.inStock })
      }

      if (request.query.categoryId) {
        const categoryId = parseInt(request.query.categoryId, 10)
        if (isNaN(categoryId) || categoryId < 1) {
          return reply.status(400).send({ error: 'Invalid categoryId format. Must be a positive integer.' })
        }
        filters.categoryId = categoryId
      }

      if (request.query.supplierId) {
        const supplierId = parseInt(request.query.supplierId, 10)
        if (isNaN(supplierId) || supplierId < 1) {
          return reply.status(400).send({ error: 'Invalid supplierId format. Must be a positive integer.' })
        }
        filters.supplierId = supplierId
      }

      const products = await this.productService.getAllProducts(filters)
      reply.send(products)
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch products' })
    }
  }

  getProductById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const id = parseInt(request.params.id, 10)
      if (isNaN(id) || id < 1) {
        return reply.status(400).send({ error: 'Invalid ID format. Must be a positive integer.' })
      }

      const product = await this.productService.getProductById(id)

      if (!product) {
        return reply.status(404).send({ error: 'Product not found' })
      }

      reply.send(product)
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch product' })
    }
  }

  createProduct = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const product = await this.productService.createProduct(request.body)
      reply.status(201).send(product)
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        reply.status(409).send({ error: error.message })
      } else {
        reply.status(400).send({ error: error.message })
      }
    }
  }

  updateProduct = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const id = parseInt(request.params.id, 10)
      if (isNaN(id) || id < 1) {
        return reply.status(400).send({ error: 'Invalid ID format. Must be a positive integer.' })
      }

      const product = await this.productService.updateProduct(id, request.body)
      reply.send(product)
    } catch (error: any) {
      if (error.message === 'Product not found') {
        reply.status(404).send({ error: error.message })
      } else if (error.message.includes('already exists')) {
        reply.status(409).send({ error: error.message })
      } else {
        reply.status(400).send({ error: error.message })
      }
    }
  }

  deleteProduct = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const id = parseInt(request.params.id, 10)
      if (isNaN(id) || id < 1) {
        return reply.status(400).send({ error: 'Invalid ID format. Must be a positive integer.' })
      }

      await this.productService.deleteProduct(id)
      reply.status(204).send()
    } catch (error: any) {
      if (error.message === 'Product not found') {
        reply.status(404).send({ error: error.message })
      } else {
        reply.status(400).send({ error: error.message })
      }
    }
  }
}