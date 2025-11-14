import type { FastifyInstance } from 'fastify'
import { PredictionController } from '../controllers/PredictionController.js'
import {
  RUN_SALES_PREDICTION_SCHEMA,
  GET_USER_PREDICTIONS_SCHEMA
} from '../dto/request/predictionSchemas.js'

interface PredictionParams {
  userId: string
}

export async function predictionRoutes(fastify: FastifyInstance) {
  const predictionController = new PredictionController()

  // POST /api/predictions/sales/:userId - Run sales prediction for a user
  fastify.post<{ Params: PredictionParams }>(
    '/predictions/sales/:userId',
    {
      schema: RUN_SALES_PREDICTION_SCHEMA
    },
    predictionController.runSalesPrediction.bind(predictionController)
  )

  // GET /api/predictions/sales/:userId - Get predictions for a user
  fastify.get<{ Params: PredictionParams }>(
    '/predictions/sales/:userId',
    {
      schema: GET_USER_PREDICTIONS_SCHEMA
    },
    predictionController.getUserPredictions.bind(predictionController)
  )

  // POST /api/predictions/daily - Run daily predictions for all users
  fastify.post(
    '/predictions/daily',
    {
      schema: {
        description: 'Run daily predictions for all users',
        tags: ['predictions'],
        response: {
          200: {
            description: 'Daily predictions completed successfully',
            type: 'object',
            properties: {
              message: { type: 'string' },
              execution_output: { type: 'string' }
            }
          },
          500: {
            description: 'Internal server error',
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'string' }
            }
          }
        }
      }
    },
    predictionController.runDailyPredictions.bind(predictionController)
  )
}
