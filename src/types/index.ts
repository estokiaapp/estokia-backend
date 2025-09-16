export interface CreateUserRequest {
  email: string
  name?: string
  password: string
}

export interface UpdateUserRequest {
  email?: string
  name?: string
}

export interface CreatePostRequest {
  title: string
  content?: string
  published?: boolean
  authorId: number
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  published?: boolean
}

// Updated interfaces for EstokIA
export interface CreateProductRequest {
  name: string
  sku: string
  categoryId?: string
  supplierId?: string
  costPrice?: number
  sellingPrice?: number
  currentStock?: number
  minimumStock?: number
  maximumStock?: number
  unitOfMeasure?: string
  description?: string
}

export interface UpdateProductRequest {
  name?: string
  sku?: string
  categoryId?: string
  supplierId?: string
  costPrice?: number
  sellingPrice?: number
  currentStock?: number
  minimumStock?: number
  maximumStock?: number
  unitOfMeasure?: string
  description?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: number
    email: string
    name?: string
  }
}