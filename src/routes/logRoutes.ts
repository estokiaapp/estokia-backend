import type { FastifyInstance } from 'fastify';
import { LogController } from '../controllers/LogController.js';

export async function logRoutes(fastify: FastifyInstance) {
  const logController = new LogController();

  // Get all logs with filters and pagination
  fastify.get('/logs', {
    preHandler: [fastify.authenticate]
  }, logController.getLogs);

  // Get recent logs
  fastify.get('/logs/recent', {
    preHandler: [fastify.authenticate]
  }, logController.getRecentLogs);

  // Get logs by user
  fastify.get('/logs/user/:userId', {
    preHandler: [fastify.authenticate]
  }, logController.getLogsByUser);

  // Get logs by resource
  fastify.get('/logs/resource/:resourceType/:resourceId', {
    preHandler: [fastify.authenticate]
  }, logController.getLogsByResource);

  // Get activity summary
  fastify.get('/logs/summary', {
    preHandler: [fastify.authenticate]
  }, logController.getActivitySummary);

  // Get error logs
  fastify.get('/logs/errors', {
    preHandler: [fastify.authenticate]
  }, logController.getErrorLogs);
}
