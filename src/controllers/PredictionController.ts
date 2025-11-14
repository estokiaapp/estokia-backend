import type { FastifyRequest, FastifyReply } from 'fastify'
import { spawn } from 'child_process'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

interface PredictionParams {
  userId: string
}

export class PredictionController {
  /**
   * Run sales prediction for a specific user
   * POST /api/predictions/sales/:userId
   */
  async runSalesPrediction(
    request: FastifyRequest<{ Params: PredictionParams }>,
    reply: FastifyReply
  ) {
    try {
      const userId = parseInt(request.params.userId, 10)

      if (isNaN(userId)) {
        return reply.status(400).send({
          error: 'Invalid user ID',
          message: 'User ID must be a valid integer'
        })
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return reply.status(404).send({
          error: 'User not found',
          message: `No user found with ID ${userId}`
        })
      }

      // Path to the ML Python script
      const mlProjectPath = path.resolve(__dirname, '../../../estokia-ml')
      const pythonScript = path.join(mlProjectPath, 'sales_prediction.py')

      // Execute Python script with user_id
      const result = await this.executePythonScript(pythonScript, mlProjectPath, userId)

      if (result.success) {
        // Fetch the forecasts that were just created today for this user
        const forecasts = await prisma.demandForecast.findMany({
          where: {
            userId: userId,
            calculationDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          },
          select: {
            id: true,
            productId: true,
            userId: true,
            daysToStockout: true,
            averageDailyDemand: true,
            confidenceLevel: true,
            calculationDate: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                currentStock: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        })

        return reply.status(200).send({
          message: 'Sales prediction completed successfully',
          user_id: userId,
          forecasts_generated: forecasts.length,
          forecasts: forecasts,
          execution_output: result.output
        })
      } else {
        return reply.status(500).send({
          error: 'Prediction execution failed',
          message: result.error,
          details: result.output
        })
      }
    } catch (error) {
      console.error('Error in runSalesPrediction:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  /**
   * Get latest predictions for all products
   * GET /api/predictions/sales/:userId
   * Note: userId parameter is kept for API compatibility but forecasts are product-based
   */
  async getUserPredictions(
    request: FastifyRequest<{ Params: PredictionParams }>,
    reply: FastifyReply
  ) {
    try {
      const userId = parseInt(request.params.userId, 10)

      if (isNaN(userId)) {
        return reply.status(400).send({
          error: 'Invalid user ID',
          message: 'User ID must be a valid integer'
        })
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return reply.status(404).send({
          error: 'User not found',
          message: `No user found with ID ${userId}`
        })
      }

      // Get demand forecasts for this specific user
      const forecasts = await prisma.demandForecast.findMany({
        where: {
          userId: userId
        },
        select: {
          id: true,
          productId: true,
          userId: true,
          daysToStockout: true,
          averageDailyDemand: true,
          confidenceLevel: true,
          calculationDate: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              currentStock: true,
              minimumStock: true
            }
          }
        },
        orderBy: {
          calculationDate: 'desc'
        },
        take: 100
      })

      return reply.status(200).send({
        user_id: userId,
        total_forecasts: forecasts.length,
        forecasts: forecasts
      })
    } catch (error) {
      console.error('Error in getUserPredictions:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  /**
   * Run daily predictions for all users
   * POST /api/predictions/daily
   */
  async runDailyPredictions(
    _request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      // Path to the ML Python script
      const mlProjectPath = path.resolve(__dirname, '../../../estokia-ml')
      const pythonScript = path.join(mlProjectPath, 'run_daily_predictions.py')

      // Execute Python script without user_id parameter
      const result = await this.executePythonScriptNoParams(pythonScript, mlProjectPath)

      if (result.success) {
        return reply.status(200).send({
          message: 'Daily predictions completed successfully',
          execution_output: result.output
        })
      } else {
        return reply.status(500).send({
          error: 'Daily prediction execution failed',
          message: result.error,
          details: result.output
        })
      }
    } catch (error) {
      console.error('Error in runDailyPredictions:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  /**
   * Execute Python script and return results
   */
  private executePythonScript(
    scriptPath: string,
    workingDir: string,
    userId: number
  ): Promise<{ success: boolean; output: string; error?: string }> {
    return new Promise((resolve) => {
      // Use the virtual environment's Python interpreter
      const pythonPath = path.join(workingDir, 'venv', 'bin', 'python3')
      const pythonProcess = spawn(pythonPath, [scriptPath, userId.toString()], {
        cwd: workingDir
      })

      let output = ''
      let errorOutput = ''

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString()
      })

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            output: output
          })
        } else {
          resolve({
            success: false,
            output: output,
            error: errorOutput || `Process exited with code ${code}`
          })
        }
      })

      pythonProcess.on('error', (error) => {
        resolve({
          success: false,
          output: output,
          error: error.message
        })
      })
    })
  }

  /**
   * Execute Python script without parameters
   */
  private executePythonScriptNoParams(
    scriptPath: string,
    workingDir: string
  ): Promise<{ success: boolean; output: string; error?: string }> {
    return new Promise((resolve) => {
      // Use the virtual environment's Python interpreter
      const pythonPath = path.join(workingDir, 'venv', 'bin', 'python3')
      const pythonProcess = spawn(pythonPath, [scriptPath], {
        cwd: workingDir
      })

      let output = ''
      let errorOutput = ''

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString()
      })

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            output: output
          })
        } else {
          resolve({
            success: false,
            output: output,
            error: errorOutput || `Process exited with code ${code}`
          })
        }
      })

      pythonProcess.on('error', (error) => {
        resolve({
          success: false,
          output: output,
          error: error.message
        })
      })
    })
  }
}
