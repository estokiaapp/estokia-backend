import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import jwt from '@fastify/jwt'
import { userRoutes } from './routes/userRoutes.js'
import { authRoutes } from './routes/authRoutes.js'
import { productRoutes } from './routes/productRoutes.js'
import { categoryRoutes } from './routes/categoryRoutes.js'
import { salesRoutes } from './routes/salesRoutes.js'
import { stockRoutes } from './routes/stockRoutes.js'
import { logRoutes } from './routes/logRoutes.js'
import { predictionRoutes } from './routes/predictionRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authenticate } from './middleware/auth.js'
import { loggingMiddleware } from './middleware/logging.js'
import MongoDBConnection from './config/mongodb.js'
import LogService from './services/LogService.js'

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
    // Connect to MongoDB for logging
    const mongodb = MongoDBConnection.getInstance()
    await mongodb.connect()
    console.log('✅ MongoDB connected for logging')

    // Log system startup
    const logService = new LogService()
    await logService.log({
      timestamp: new Date(),
      eventType: 'SYSTEM_STARTUP',
      action: 'START',
      description: 'Application started',
      severity: 'INFO',
    })

    fastify.setErrorHandler(errorHandler)

    await fastify.register(jwt, {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
    })

    fastify.decorate('authenticate', authenticate)

    // Register logging middleware
    fastify.addHook('onRequest', loggingMiddleware)

    await fastify.register(cors, {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true
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
            url: 'http://localhost:8080',
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
    await fastify.register(categoryRoutes, { prefix: '/api'})
    await fastify.register(salesRoutes, { prefix: '/api'})
    await fastify.register(stockRoutes, { prefix: '/api'})
    await fastify.register(logRoutes, { prefix: '/api'})
    await fastify.register(predictionRoutes, { prefix: '/api'})

    const port = process.env.PORT ? parseInt(process.env.PORT) : 8080
    const host = process.env.HOST || '0.0.0.0'

    await fastify.listen({ port, host })
    console.log(`🚀 Server running at http://${host}:${port}`)
    console.log(`📚 API Documentation at http://${host}:${port}/docs`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')

  const logService = new LogService()
  await logService.log({
    timestamp: new Date(),
    eventType: 'SYSTEM_SHUTDOWN',
    action: 'STOP',
    description: 'Application shutting down',
    severity: 'INFO',
  })

  const mongodb = MongoDBConnection.getInstance()
  await mongodb.disconnect()
  await fastify.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...')

  const logService = new LogService()
  await logService.log({
    timestamp: new Date(),
    eventType: 'SYSTEM_SHUTDOWN',
    action: 'STOP',
    description: 'Application shutting down (SIGINT)',
    severity: 'INFO',
  })

  const mongodb = MongoDBConnection.getInstance()
  await mongodb.disconnect()
  await fastify.close()
  process.exit(0)
})

start()