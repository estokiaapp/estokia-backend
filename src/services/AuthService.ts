import { UserRepository } from '../repositories/UserRepository.js'
import { comparePassword } from '../utils/auth.js'

export class AuthService {
  private userRepository = new UserRepository()

  async login(credentials: any) {
    const { email, password } = credentials

    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      return null
    }

    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return null
    }

    return user
  }

  async getCurrentUser(userId: string) {
    if (!userId) {
      throw new Error('User ID is required')
    }

    return await this.userRepository.findById(userId)
  }
}