import { CategoryRepository } from '../repositories/CategoryRepository.js'

export class CategoryService {
  private categoryRepository = new CategoryRepository()

  async getAllCategories() {
    return await this.categoryRepository.findMany()
  }

  async getCategoryById(id: string) {
    if (!id) throw new Error('Category ID is required')
    return await this.categoryRepository.findById(id)
  }

  async createCategory(categoryData: any) {
    if (!categoryData.name) {
      throw new Error('Category name is required')
    }

    const existingCategory = await this.categoryRepository.findByName(categoryData.name)
    if (existingCategory) {
      throw new Error('Category with this name already exists')
    }

    return await this.categoryRepository.create(categoryData)
  }

  async updateCategory(id: string, categoryData: any) {
    if (!id) throw new Error('Category ID is required')

    const existingCategory = await this.categoryRepository.findById(id)
    if (!existingCategory) {
      throw new Error('Category not found')
    }

    if (categoryData.name) {
      const categoryWithName = await this.categoryRepository.findByName(categoryData.name)
      if (categoryWithName && categoryWithName.id !== id) {
        throw new Error('Category name already in use')
      }
    }

    return await this.categoryRepository.update(id, categoryData)
  }

  async deleteCategory(id: string) {
    if (!id) throw new Error('Category ID is required')

    const existingCategory = await this.categoryRepository.findById(id)
    if (!existingCategory) {
      throw new Error('Category not found')
    }

    await this.categoryRepository.delete(id)
  }
}