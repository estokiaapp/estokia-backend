import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import jwt from '@fastify/jwt'
import { userRoutes } from './routes/userRoutes.js'
import { authRoutes } from './routes/authRoutes.js'
import { productRoutes } from './routes/productRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authenticate } from './middleware/auth.js'

const fastify = Fastify({ 
  logger: true,
  ajv: {
    customOptions: {
      allErrors: true
    }
  }
})

async function start() {
  try {
    fastify.setErrorHandler(errorHandler)
    
    await fastify.register(jwt, {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
    })

    fastify.decorate('authenticate', authenticate)
    
    await fastify.register(cors, {
      origin: true
    })

    await fastify.register(swagger, {
      openapi: {
        openapi: '3.0.0',
        info: {
          title: 'Estokia Backend API',
          description: 'RESTful API built with Fastify, Prisma & TypeScript',
          version: '1.0.0'
        },
        servers: [
          {
            url: 'http://localhost:3000',
            description: 'Development server'
          }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        }
      }
    })

    await fastify.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false
      }
    })

    fastify.get('/', async () => {
      return { message: 'Estokia Backend API is running!' }
    })

    await fastify.register(authRoutes, { prefix: '/api' })
    await fastify.register(userRoutes, { prefix: '/api' })
    await fastify.register(productRoutes, { prefix: '/api'})

    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
    const host = process.env.HOST || '0.0.0.0'

    await fastify.listen({ port, host })
    console.log(`🚀 Server running at http://${host}:${port}`)
    console.log(`📚 API Documentation at http://${host}:${port}/docs`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()