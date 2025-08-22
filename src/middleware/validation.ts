import type { FastifyReply } from 'fastify'

export interface ValidationError {
  field: string
  message: string
}

export function validateEmail(email: string): ValidationError | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Invalid email format' }
  }
  return null
}

export function validateRequired(value: any, fieldName: string): ValidationError | null {
  if (value === undefined || value === null || value === '') {
    return { field: fieldName, message: `${fieldName} is required` }
  }
  return null
}

export function validateString(value: any, fieldName: string, minLength?: number, maxLength?: number): ValidationError | null {
  if (typeof value !== 'string') {
    return { field: fieldName, message: `${fieldName} must be a string` }
  }
  
  if (minLength !== undefined && value.length < minLength) {
    return { field: fieldName, message: `${fieldName} must be at least ${minLength} characters long` }
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    return { field: fieldName, message: `${fieldName} must be no more than ${maxLength} characters long` }
  }
  
  return null
}

export function handleValidationErrors(errors: ValidationError[], reply: FastifyReply) {
  if (errors.length > 0) {
    reply.status(400).send({
      error: 'Validation failed',
      details: errors
    })
    return true
  }
  return false
}