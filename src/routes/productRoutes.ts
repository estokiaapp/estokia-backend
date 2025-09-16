import type { FastifyInstance } from 'fastify'
import { ProductController } from '../controllers/ProductController.js'
import type { CreateProductRequest, UpdateProductRequest } from '../types/index.js'
import { 
  CREATE_PRODUCT_SCHEMA, 
  UPDATE_PRODUCT_SCHEMA, 
  GET_PRODUCTS_SCHEMA, 
  GET_PRODUCT_SCHEMA, 
  DELETE_PRODUCT_SCHEMA 
} from '../dto/request/productSchemas.js'

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
  const productController = new ProductController()

  fastify.get<{ Querystring: ProductQuery }>('/products', {
    schema: GET_PRODUCTS_SCHEMA
  }, productController.getAllProducts)

  fastify.get<{ Params: ProductParams }>('/products/:id', {
    schema: GET_PRODUCT_SCHEMA
  }, productController.getProductById)

  fastify.post<{ Body: CreateProductRequest }>('/products', {
    schema: CREATE_PRODUCT_SCHEMA
  }, productController.createProduct)

  fastify.put<{ Params: ProductParams; Body: UpdateProductRequest }>('/products/:id', {
    schema: UPDATE_PRODUCT_SCHEMA
  }, productController.updateProduct)

  fastify.delete<{ Params: ProductParams }>('/products/:id', {
    schema: DELETE_PRODUCT_SCHEMA
  }, productController.deleteProduct)
}