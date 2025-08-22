import type { FastifyRequest, FastifyReply, FastifyError } from 'fastify'

export interface ErrorResponse {
  error: string
  message?: string
  statusCode: number
  timestamp: string
}

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const timestamp = new Date().toISOString()
  
  request.log.error(error)

  if (error.validation) {
    const errorResponse: ErrorResponse = {
      error: 'Validation Error',
      message: 'Invalid request data',
      statusCode: 400,
      timestamp
    }
    
    reply.status(400).send({
      ...errorResponse,
      details: error.validation
    })
    return
  }

  if (error.statusCode) {
    const errorResponse: ErrorResponse = {
      error: error.name || 'Error',
      message: error.message,
      statusCode: error.statusCode,
      timestamp
    }
    
    reply.status(error.statusCode).send(errorResponse)
    return
  }

  const errorResponse: ErrorResponse = {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    statusCode: 500,
    timestamp
  }
  
  reply.status(500).send(errorResponse)
}