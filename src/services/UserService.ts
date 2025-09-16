import { UserRepository } from '../repositories/UserRepository.js'
import { hashPassword } from '../utils/auth.js'

export class UserService {
  private userRepository = new UserRepository()

  async getAllUsers() {
    return await this.userRepository.findMany()
  }

  async getUserById(id: number) {
    if (!id) throw new Error('User ID is required')
    return await this.userRepository.findById(id)
  }

  async createUser(userData: any) {
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required')
    }

    const existingUser = await this.userRepository.findByEmail(userData.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const hashedPassword = await hashPassword(userData.password)
    
    return await this.userRepository.create({
      ...userData,
      password: hashedPassword
    })
  }

  async updateUser(id: number, userData: any) {
    if (!id) throw new Error('User ID is required')

    const existingUser = await this.userRepository.findById(id)
    if (!existingUser) {
      throw new Error('User not found')
    }

    if (userData.email) {
      const userWithEmail = await this.userRepository.findByEmail(userData.email)
      if (userWithEmail && userWithEmail.id !== id) {
        throw new Error('Email already in use')
      }
    }

    return await this.userRepository.update(id, userData)
  }

  async deleteUser(id: number) {
    if (!id) throw new Error('User ID is required')

    const existingUser = await this.userRepository.findById(id)
    if (!existingUser) {
      throw new Error('User not found')
    }

    await this.userRepository.delete(id)
  }
}