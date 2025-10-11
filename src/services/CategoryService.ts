import { CategoryRepository } from '../repositories/CategoryRepository.js'
import LogService from './LogService.js'

export class CategoryService {
  private categoryRepository = new CategoryRepository()
  private logService = new LogService()

  async getAllCategories() {
    return await this.categoryRepository.findMany()
  }

  async getCategoryById(id: number) {
    if (!id) throw new Error('Category ID is required')
    return await this.categoryRepository.findById(id)
  }

  async createCategory(categoryData: any, userId?: number, userName?: string) {
    try {
      if (!categoryData.name) {
        throw new Error('Category name is required')
      }

      const existingCategory = await this.categoryRepository.findByName(categoryData.name)
      if (existingCategory) {
        throw new Error('Category with this name already exists')
      }

      const category = await this.categoryRepository.create(categoryData)

      // Log category creation
      await this.logService.log({
        timestamp: new Date(),
        eventType: 'CATEGORY_CREATED',
        action: 'CREATE',
        userId,
        userName,
        resourceType: 'CATEGORY',
        resourceId: category.id,
        description: `Category "${category.name}" created`,
        metadata: {
          name: category.name,
          description: category.description,
        },
        severity: 'INFO',
      })

      return category
    } catch (error) {
      await this.logService.logError(error as Error, {
        operation: 'createCategory',
        eventType: 'DATABASE_ERROR',
        data: categoryData,
        userId,
      })
      throw error
    }
  }

  async updateCategory(id: number, categoryData: any, userId?: number, userName?: string) {
    try {
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

      const updatedCategory = await this.categoryRepository.update(id, categoryData)

      // Log category update
      await this.logService.log({
        timestamp: new Date(),
        eventType: 'CATEGORY_UPDATED',
        action: 'UPDATE',
        userId,
        userName,
        resourceType: 'CATEGORY',
        resourceId: id,
        description: `Category "${updatedCategory.name}" updated`,
        changes: {
          before: existingCategory,
          after: updatedCategory,
        },
        severity: 'INFO',
      })

      return updatedCategory
    } catch (error) {
      await this.logService.logError(error as Error, {
        operation: 'updateCategory',
        eventType: 'DATABASE_ERROR',
        categoryId: id,
        userId,
      })
      throw error
    }
  }

  async deleteCategory(id: number, userId?: number, userName?: string) {
    try {
      if (!id) throw new Error('Category ID is required')

      const existingCategory = await this.categoryRepository.findById(id)
      if (!existingCategory) {
        throw new Error('Category not found')
      }

      await this.categoryRepository.delete(id)

      // Log category deletion
      await this.logService.log({
        timestamp: new Date(),
        eventType: 'CATEGORY_DELETED',
        action: 'DELETE',
        userId,
        userName,
        resourceType: 'CATEGORY',
        resourceId: id,
        description: `Category "${existingCategory.name}" deleted`,
        metadata: {
          name: existingCategory.name,
        },
        severity: 'INFO',
      })
    } catch (error) {
      await this.logService.logError(error as Error, {
        operation: 'deleteCategory',
        eventType: 'DATABASE_ERROR',
        categoryId: id,
        userId,
      })
      throw error
    }
  }
}