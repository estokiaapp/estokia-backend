import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import type { CreateProductRequest, UpdateProductRequest } from '../types/index.js'
import { 
  CREATE_PRODUCT_SCHEMA, 
  UPDATE_PRODUCT_SCHEMA, 
  GET_PRODUCTS_SCHEMA, 
  GET_PRODUCT_SCHEMA, 
  DELETE_PRODUCT_SCHEMA 
} from '../dto/request/products.ts'

const prisma = new PrismaClient()

interface ProductParams {
  id: string
}

interface ProductQuery {
  categoryId?: string
  supplierId?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}

export async function productRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: ProductQuery }>('/products', {
    schema: GET_PRODUCTS_SCHEMA
  }, async (request: FastifyRequest<{ Querystring: ProductQuery }>, reply: FastifyReply) => {
    try {
      const { categoryId, supplierId, minPrice, maxPrice, inStock } = request.query

      const where: any = {}

      if (categoryId) {
        where.categoryId = categoryId
      }
      
      if (supplierId) {
        where.supplierId = supplierId
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.sellingPrice = {}
        if (minPrice !== undefined) {
          where.sellingPrice.gte = minPrice
        }
        if (maxPrice !== undefined) {
          where.sellingPrice.lte = maxPrice
        }
      }

      if (inStock !== undefined) {
        if (inStock) {
          where.currentStock = { gt: 0 }
        } else {
          where.currentStock = { lte: 0 }
        }
      }

      const products = await prisma.product.findMany({
        where
      })
      
      return products
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch products' })
    }
  })

  fastify.get<{ Params: ProductParams }>('/products/:id', {
    schema: GET_PRODUCT_SCHEMA
  }, async (request: FastifyRequest<{ Params: ProductParams }>, reply: FastifyReply) => {
    try {
      const productId = request.params.id
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })
      
      if (!product) {
        return reply.status(404).send({ error: 'Product not found' })
      }
      
      return product
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch product' })
    }
  })

  fastify.post<{ Body: CreateProductRequest }>('/products', {
    schema: CREATE_PRODUCT_SCHEMA
  }, async (request: FastifyRequest<{ Body: CreateProductRequest }>, reply: FastifyReply) => {
    try {
      const product = await prisma.product.create({
        data: request.body
      })
      
      reply.status(201).send(product)
    } catch (error) {
      if (error.code === 'P2002') {
        reply.status(400).send({ error: 'Product with this SKU already exists' })
      } else {
        reply.status(500).send({ error: 'Failed to create product' })
      }
    }
  })

  fastify.put<{ Params: ProductParams; Body: UpdateProductRequest }>('/products/:id', {
    schema: UPDATE_PRODUCT_SCHEMA
  }, async (request: FastifyRequest<{ Params: ProductParams; Body: UpdateProductRequest }>, reply: FastifyReply) => {
    try {
      const productId = request.params.id
      
      const existingProduct = await prisma.product.findUnique({
        where: { id: productId }
      })
      
      if (!existingProduct) {
        return reply.status(404).send({ error: 'Product not found' })
      }
      
      const product = await prisma.product.update({
        where: { id: productId },
        data: request.body
      })
      
      return product
    } catch (error) {
      if (error.code === 'P2002') {
        reply.status(400).send({ error: 'Product with this SKU already exists' })
      } else {
        reply.status(500).send({ error: 'Failed to update product' })
      }
    }
  })

  fastify.delete<{ Params: ProductParams }>('/products/:id', {
    schema: DELETE_PRODUCT_SCHEMA
  }, async (request: FastifyRequest<{ Params: ProductParams }>, reply: FastifyReply) => {
    try {
      const productId = request.params.id
      
      const existingProduct = await prisma.product.findUnique({
        where: { id: productId }
      })
      
      if (!existingProduct) {
        return reply.status(404).send({ error: 'Product not found' })
      }
      
      await prisma.product.delete({
        where: { id: productId }
      })
      
      reply.status(204).send()
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete product' })
    }
  })
}