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
}
