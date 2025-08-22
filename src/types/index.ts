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