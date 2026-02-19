import { healthRoutes } from './health.routes';

import type { FastifyInstance } from 'fastify';


/**
 * Register all API routes
 */
export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // System routes
  await app.register(healthRoutes);

  // Add your routes here:
  // await app.register(productRoutes);
  // await app.register(orderRoutes);
}

export { healthRoutes } from './health.routes';
