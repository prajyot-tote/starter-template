import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { db } from '@/server/db';
import { registry } from '../openapi/registry';

// ============================================
// OPENAPI SCHEMA REGISTRATION
// ============================================

const healthResponseSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  timestamp: z.string().datetime(),
  version: z.string(),
  checks: z.object({
    database: z.enum(['connected', 'disconnected']),
  }),
});

registry.registerPath({
  method: 'get',
  path: '/health',
  tags: ['System'],
  summary: 'Health check',
  description: 'Returns the health status of the API',
  security: [], // No auth required
  responses: {
    200: {
      description: 'Service is healthy',
      content: {
        'application/json': {
          schema: healthResponseSchema,
        },
      },
    },
    503: {
      description: 'Service is unhealthy',
      content: {
        'application/json': {
          schema: healthResponseSchema,
        },
      },
    },
  },
});

// ============================================
// ROUTE HANDLERS
// ============================================

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async (request, reply) => {
    let isDatabaseConnected = false;

    try {
      await db.$queryRaw`SELECT 1`;
      isDatabaseConnected = true;
    } catch {
      isDatabaseConnected = false;
    }

    const isHealthy = isDatabaseConnected;
    const status = isHealthy ? 'healthy' : 'unhealthy';

    const response = {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: isDatabaseConnected ? 'connected' : 'disconnected',
      },
    };

    return reply.status(isHealthy ? 200 : 503).send(response);
  });
}
