import type { FastifyRequest, FastifyReply } from 'fastify'
import { ProductService } from '../services/ProductService.js'

interface ProductQuery {
  categoryId?: string
  supplierId?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}

export class ProductController {
  private productService = new ProductService()

  getAllProducts = async (request: FastifyRequest<{ Querystring: ProductQuery }>, reply: FastifyReply) => {
    try {
      const products = await this.productService.getAllProducts(request.query)
      reply.send(products)
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch products' })
    }
  }

  getProductById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const product = await this.productService.getProductById(request.params.id)
      
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
      const product = await this.productService.updateProduct(request.params.id, request.body)
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
      await this.productService.deleteProduct(request.params.id)
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