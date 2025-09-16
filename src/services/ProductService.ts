import { ProductRepository } from '../repositories/ProductRepository.js'

interface ProductFilters {
  categoryId?: string
  supplierId?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}

export class ProductService {
  private productRepository = new ProductRepository()

  async getAllProducts(filters?: ProductFilters) {
    return await this.productRepository.findMany(filters)
  }

  async getProductById(id: string) {
    if (!id) throw new Error('Product ID is required')
    return await this.productRepository.findById(id)
  }

  async createProduct(productData: any) {
    if (!productData.name || !productData.sku) {
      throw new Error('Name and SKU are required')
    }

    const existingProduct = await this.productRepository.findBySku(productData.sku)
    if (existingProduct) {
      throw new Error('Product with this SKU already exists')
    }

    this.validateProductData(productData)
    return await this.productRepository.create(productData)
  }

  async updateProduct(id: string, productData: any) {
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
    return await this.productRepository.update(id, productData)
  }

  async deleteProduct(id: string) {
    if (!id) throw new Error('Product ID is required')

    const existingProduct = await this.productRepository.findById(id)
    if (!existingProduct) {
      throw new Error('Product not found')
    }

    await this.productRepository.delete(id)
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