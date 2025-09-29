import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { userRoutes } from '../../routes/userRoutes.js';
import { authRoutes } from '../../routes/authRoutes.js';
import { productRoutes } from '../../routes/productRoutes.js';
import { salesRoutes } from '../../routes/salesRoutes.js';
import { stockRoutes } from '../../routes/stockRoutes.js';
import { errorHandler } from '../../middleware/errorHandler.js';
import { authenticate } from '../../middleware/auth.js';

export async function createTestApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false,
    ajv: {
      customOptions: {
        allErrors: true
      }
    }
  });

  app.setErrorHandler(errorHandler);
  
  await app.register(jwt, {
    secret: 'test-secret-key'
  });

  app.decorate('authenticate', authenticate);
  
  await app.register(cors, {
    origin: true
  });

  await app.register(authRoutes, { prefix: '/api' });
  await app.register(userRoutes, { prefix: '/api' });
  await app.register(productRoutes, { prefix: '/api' });
  await app.register(salesRoutes, { prefix: '/api' });
  await app.register(stockRoutes, { prefix: '/api' });

  await app.ready();
  
  return app;
}

export function generateValidJWT(app: FastifyInstance, payload: any = { id: '1', email: 'test@example.com' }): string {
  return app.jwt.sign(payload);
}