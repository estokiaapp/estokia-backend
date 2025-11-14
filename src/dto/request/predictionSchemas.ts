export const RUN_SALES_PREDICTION_SCHEMA = {
  description: 'Run sales prediction for a specific user',
  tags: ['predictions'],
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: {
        type: 'string',
        description: 'User ID to run predictions for',
        pattern: '^[0-9]+$'
      }
    }
  },
  response: {
    200: {
      description: 'Prediction completed successfully',
      type: 'object',
      properties: {
        message: { type: 'string' },
        user_id: { type: 'number' },
        forecasts_generated: { type: 'number' },
        forecasts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              productId: { type: 'number' },
              userId: { type: 'number' },
              daysToStockout: { type: ['number', 'null'] },
              averageDailyDemand: { type: ['number', 'null'] },
              confidenceLevel: { type: ['string', 'null'] },
              calculationDate: { type: 'string' },
              createdAt: { type: 'string' },
              product: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  sku: { type: 'string' },
                  currentStock: { type: 'number' }
                }
              }
            }
          }
        },
        execution_output: { type: 'string' }
      }
    },
    400: {
      description: 'Invalid user ID',
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' }
      }
    },
    404: {
      description: 'User not found',
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' }
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

export const GET_USER_PREDICTIONS_SCHEMA = {
  description: 'Get latest predictions for a specific user',
  tags: ['predictions'],
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: {
        type: 'string',
        description: 'User ID to get predictions for',
        pattern: '^[0-9]+$'
      }
    }
  },
  response: {
    200: {
      description: 'Successfully retrieved predictions',
      type: 'object',
      properties: {
        user_id: { type: 'number' },
        total_forecasts: { type: 'number' },
        forecasts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              productId: { type: 'number' },
              userId: { type: 'number' },
              daysToStockout: { type: ['number', 'null'] },
              averageDailyDemand: { type: ['number', 'null'] },
              confidenceLevel: { type: ['string', 'null'] },
              calculationDate: { type: 'string' },
              createdAt: { type: 'string' },
              product: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  sku: { type: 'string' },
                  currentStock: { type: 'number' },
                  minimumStock: { type: 'number' }
                }
              }
            }
          }
        }
      }
    },
    400: {
      description: 'Invalid user ID',
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' }
      }
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' }
      }
    }
  }
}
