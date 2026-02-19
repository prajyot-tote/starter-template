// ============================================
// SERVER ENTRY POINT
// ============================================

import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';

import { errorHandler } from '@/server/api/middleware';
import { generateOpenAPIDocument } from '@/server/api/openapi/registry';
import { registerRoutes } from '@/server/api/routes';
import { db } from '@/server/db';

// Import routes to register OpenAPI schemas
import '@/server/api/routes/health.routes';
// Add your route imports here:
// import '@/server/api/routes/product.routes';

async function main(): Promise<void> {
  const isDev = process.env['NODE_ENV'] === 'development';

  const app = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] ?? 'info',
      ...(isDev && {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        },
      }),
    },
  });

  // ============================================
  // PLUGINS
  // ============================================

  // Security headers
  await app.register(helmet);

  // CORS
  await app.register(cors, {
    origin: process.env['CORS_ORIGIN'] ?? true,
    credentials: true,
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // ============================================
  // OPENAPI / SWAGGER
  // ============================================

  const openApiSpec = generateOpenAPIDocument();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  await app.register(swagger, {
    mode: 'static',
    specification: {
      document: openApiSpec,
    },
  } as any);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // ============================================
  // ERROR HANDLING
  // ============================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.setErrorHandler(errorHandler as any);

  // ============================================
  // ROUTES
  // ============================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await registerRoutes(app as any);

  // ============================================
  // DATABASE & START
  // ============================================

  try {
    await db.$connect();
    app.log.info('✅ Database connected');
  } catch (error) {
    app.log.error({ err: error }, '❌ Database connection failed');
    process.exit(1);
  }

  const port = Number(process.env['PORT']) || 3000;
  const host = process.env['HOST'] ?? '0.0.0.0';

  try {
    await app.listen({ port, host });
    app.log.info(`🚀 Server running on http://${host}:${port}`);
    app.log.info(`📚 API Docs available at http://${host}:${port}/docs`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    app.log.info(`Received ${signal}, shutting down...`);
    await app.close();
    await db.$disconnect();
    process.exit(0);
  };

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => void shutdown(signal));
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
