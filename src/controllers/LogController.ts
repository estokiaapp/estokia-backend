import type { FastifyRequest, FastifyReply } from 'fastify';
import LogService from '../services/LogService.js';
import type { LogFilters, LogPagination } from '../types/logs.js';

export class LogController {
  private logService = new LogService();

  getLogs = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;

      const filters: Partial<LogFilters> = {};

      if (query.eventType) {
        filters.eventType = Array.isArray(query.eventType) ? query.eventType : [query.eventType];
      }
      if (query.userId) {
        filters.userId = parseInt(query.userId);
      }
      if (query.resourceType) {
        filters.resourceType = query.resourceType;
      }
      if (query.resourceId) {
        filters.resourceId = parseInt(query.resourceId);
      }
      if (query.severity) {
        filters.severity = Array.isArray(query.severity) ? query.severity : [query.severity];
      }
      if (query.startDate) {
        filters.startDate = new Date(query.startDate);
      }
      if (query.endDate) {
        filters.endDate = new Date(query.endDate);
      }
      if (query.search) {
        filters.search = query.search;
      }

      const pagination: LogPagination = {
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 50,
        sortBy: query.sortBy || 'timestamp',
        sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc',
      };

      const result = await this.logService.getLogs(filters, pagination);

      reply.send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  };

  getLogsByUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as any;
      const query = request.query as any;

      const userId = parseInt(params.userId);
      const limit = query.limit ? parseInt(query.limit) : 100;

      const logs = await this.logService.getLogsByUser(userId, limit);

      reply.send({
        success: true,
        data: logs,
      });
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  };

  getLogsByResource = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as any;

      const resourceType = params.resourceType;
      const resourceId = parseInt(params.resourceId);

      const logs = await this.logService.getLogsByResource(resourceType, resourceId);

      reply.send({
        success: true,
        data: logs,
      });
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  };

  getRecentLogs = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;
      const limit = query.limit ? parseInt(query.limit) : 100;

      const logs = await this.logService.getRecentLogs(limit);

      reply.send({
        success: true,
        data: logs,
      });
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  };

  getErrorLogs = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;

      const startDate = query.startDate ? new Date(query.startDate) : undefined;
      const endDate = query.endDate ? new Date(query.endDate) : undefined;

      const logs = await this.logService.getErrorLogs(startDate, endDate);

      reply.send({
        success: true,
        data: logs,
      });
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  };

  getActivitySummary = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;

      const startDate = query.startDate ? new Date(query.startDate) : undefined;
      const endDate = query.endDate ? new Date(query.endDate) : undefined;

      const summary = await this.logService.getActivitySummary(startDate, endDate);

      reply.send({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  };
}
