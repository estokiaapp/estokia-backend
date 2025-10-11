import type { FastifyRequest, FastifyReply } from 'fastify';
import LogService from '../services/LogService.js';

const logService = new LogService();

export async function loggingMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const startTime = Date.now();

  reply.raw.on('finish', async () => {
    const duration = Date.now() - startTime;

    // Only log important endpoints, skip health checks and static files
    if (shouldLogRequest(request)) {
      await logService.log({
        timestamp: new Date(),
        eventType: 'API_REQUEST',
        action: `${request.method} ${request.url}`,
        userId: (request as any).user?.id,
        userName: (request as any).user?.name,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || undefined,
        statusCode: reply.statusCode,
        duration,
        description: `${request.method} ${request.url} - ${reply.statusCode}`,
        metadata: {
          method: request.method,
          url: request.url,
          params: request.params,
          query: request.query,
        },
        severity: reply.statusCode >= 500 ? 'ERROR' : reply.statusCode >= 400 ? 'WARNING' : 'INFO',
      });
    }
  });
}

function shouldLogRequest(request: FastifyRequest): boolean {
  // Skip logging for these paths
  const skipPaths = ['/health', '/metrics', '/favicon.ico'];
  const path = request.url?.split('?')[0]; // Remove query params

  if (!path) {
    return false;
  }

  // Skip if path matches skip list
  if (skipPaths.includes(path)) {
    return false;
  }

  // Skip static file requests
  if (path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return false;
  }

  return true;
}
