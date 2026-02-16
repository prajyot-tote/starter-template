// ============================================
// SERVER ENTRY POINT
// ============================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { db } from '@/server/db';
import { registerRoutes } from '@/server/api/routes';
import { errorHandler } from '@/server/api/middleware';
import { generateOpenAPIDocument } from '@/server/api/openapi/registry';

// Import routes to register OpenAPI schemas
import '@/server/api/routes/user.routes';
import '@/server/api/routes/health.routes';

async function main(): Promise<void> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  // ============================================
  // PLUGINS
  // ============================================

  // Security headers
  await app.register(helmet);

  // CORS
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || true,
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

  await app.register(swagger, {
    mode: 'static',
    specification: {
      document: openApiSpec as Record<string, unknown>,
    },
  });

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

  app.setErrorHandler(errorHandler);

  // ============================================
  // ROUTES
  // ============================================

  await registerRoutes(app);

  // ============================================
  // DATABASE & START
  // ============================================

  try {
    await db.$connect();
    app.log.info('✅ Database connected');
  } catch (error) {
    app.log.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });
    app.log.info(`🚀 Server running on http://${host}:${port}`);
    app.log.info(`📚 API Docs available at http://${host}:${port}/docs`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  // Graceful shutdown
  const signals = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, shutting down...`);
      await app.close();
      await db.$disconnect();
      process.exit(0);
    });
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
