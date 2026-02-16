import type { FastifyInstance } from 'fastify';

import { userRoutes } from './user.routes';
import { healthRoutes } from './health.routes';

/**
 * Register all API routes
 */
export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // System routes
  await app.register(healthRoutes);

  // API routes (prefix with /api/v1 if desired)
  await app.register(userRoutes);

  // Add more routes here:
  // await app.register(productRoutes);
  // await app.register(orderRoutes);
}

export { userRoutes } from './user.routes';
export { healthRoutes } from './health.routes';
