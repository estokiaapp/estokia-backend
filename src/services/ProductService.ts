import { ProductRepository } from '../repositories/ProductRepository.js'
import LogService from './LogService.js'

interface ProductFilters {
  categoryId?: number
  supplierId?: number
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}

export class ProductService {
  private productRepository = new ProductRepository()
  private logService = new LogService()

  async getAllProducts(filters?: ProductFilters) {
    return await this.productRepository.findMany(filters)
  }

  async getProductById(id: number) {
    if (!id) throw new Error('Product ID is required')
    return await this.productRepository.findById(id)
  }

  async createProduct(productData: any, userId?: number, userName?: string) {
    try {
      if (!productData.name || !productData.sku) {
        throw new Error('Name and SKU are required')
      }

      const existingProduct = await this.productRepository.findBySku(productData.sku)
      if (existingProduct) {
        throw new Error('Product with this SKU already exists')
      }

      this.validateProductData(productData)
      const product = await this.productRepository.create(productData)

      // Log successful creation
      await this.logService.log({
        timestamp: new Date(),
        eventType: 'PRODUCT_CREATED',
        action: 'CREATE',
        userId,
        userName,
        resourceType: 'PRODUCT',
        resourceId: product.id,
        description: `Product "${product.name}" created`,
        metadata: {
          sku: product.sku,
          categoryId: product.categoryId,
          supplierId: product.supplierId,
          sellingPrice: product.sellingPrice,
        },
        severity: 'INFO',
      })

      return product
    } catch (error) {
      // Log error
      await this.logService.logError(error as Error, {
        operation: 'createProduct',
        eventType: 'DATABASE_ERROR',
        data: productData,
        userId,
      })
      throw error
    }
  }

  async updateProduct(id: number, productData: any, userId?: number, userName?: string) {
    try {
      if (!id) throw new Error('Product ID is required')

      const existingProduct = await this.productRepository.findById(id)
      if (!existingProduct) {
        throw new Error('Product not found')
      }

      if (productData.sku && productData.sku !== existingProduct.sku) {
        const productWithSku = await this.productRepository.findBySku(productData.sku)
        if (productWithSku) {
          throw new Error('Product with this SKU already exists')
        }
      }

      this.validateProductData(productData)
      const updatedProduct = await this.productRepository.update(id, productData)

      // Log update with before/after
      await this.logService.log({
        timestamp: new Date(),
        eventType: 'PRODUCT_UPDATED',
        action: 'UPDATE',
        userId,
        userName,
        resourceType: 'PRODUCT',
        resourceId: id,
        description: `Product "${updatedProduct.name}" updated`,
        changes: {
          before: existingProduct,
          after: updatedProduct,
        },
        severity: 'INFO',
      })

      return updatedProduct
    } catch (error) {
      await this.logService.logError(error as Error, {
        operation: 'updateProduct',
        eventType: 'DATABASE_ERROR',
        productId: id,
        userId,
      })
      throw error
    }
  }

  async deleteProduct(id: number, userId?: number, userName?: string) {
    try {
      if (!id) throw new Error('Product ID is required')

      const existingProduct = await this.productRepository.findById(id)
      if (!existingProduct) {
        throw new Error('Product not found')
      }

      await this.productRepository.delete(id)

      // Log deletion
      await this.logService.log({
        timestamp: new Date(),
        eventType: 'PRODUCT_DELETED',
        action: 'DELETE',
        userId,
        userName,
        resourceType: 'PRODUCT',
        resourceId: id,
        description: `Product "${existingProduct.name}" deleted`,
        metadata: {
          sku: existingProduct.sku,
          name: existingProduct.name,
        },
        severity: 'INFO',
      })
    } catch (error) {
      await this.logService.logError(error as Error, {
        operation: 'deleteProduct',
        eventType: 'DATABASE_ERROR',
        productId: id,
        userId,
      })
      throw error
    }
  }

  private validateProductData(data: any) {
    if (data.costPrice !== undefined && data.costPrice < 0) {
      throw new Error('Cost price cannot be negative')
    }
    if (data.sellingPrice !== undefined && data.sellingPrice < 0) {
      throw new Error('Selling price cannot be negative')
    }
    if (data.currentStock !== undefined && data.currentStock < 0) {
      throw new Error('Current stock cannot be negative')
    }
    if (data.minimumStock !== undefined && data.minimumStock < 0) {
      throw new Error('Minimum stock cannot be negative')
    }
    if (data.maximumStock !== undefined && data.maximumStock < 0) {
      throw new Error('Maximum stock cannot be negative')
    }
    if (data.minimumStock !== undefined && data.maximumStock !== undefined && data.minimumStock > data.maximumStock) {
      throw new Error('Minimum stock cannot be greater than maximum stock')
    }
  }
}