import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import type { JWTPayload } from '../utils/auth.js'

declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload
  }
  
  interface FastifyInstance {
    authenticate: typeof authenticate
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = await request.jwtVerify<JWTPayload>()
    request.user = token
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or missing token' })
  }
}