/**
 * Route Template
 *
 * Copy this file and rename to create new routes.
 * Example: product.routes.ts, order.routes.ts
 *
 * Steps:
 * 1. Copy this file to {entity}.routes.ts
 * 2. Import your Zod schemas from @/schemas
 * 3. Register OpenAPI paths
 * 4. Implement route handlers
 * 5. Export and register in index.ts
 * 6. Import in openapi/generate.ts
 * 7. Run: npm run api:generate
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Import your schemas
// import { entitySchema, createEntitySchema, updateEntitySchema } from '@/schemas';

// Import your service
// import { entityService } from '@/server/services';

import {
  registry,
  successResponse,
  errorResponseSchema,
  paginationQuerySchema,
} from '../openapi/registry';
import { authenticate } from '../middleware';

// ============================================
// OPENAPI SCHEMA REGISTRATION
// ============================================

// Example: Register your schemas
// registry.register('Entity', entitySchema);
// registry.register('CreateEntity', createEntitySchema);

// Example: Register GET /entities
// registry.registerPath({
//   method: 'get',
//   path: '/entities',
//   tags: ['Entities'],
//   summary: 'List all entities',
//   request: {
//     query: paginationQuerySchema,
//   },
//   responses: {
//     200: {
//       description: 'List of entities',
//       content: {
//         'application/json': {
//           schema: successResponse(z.array(entitySchema)),
//         },
//       },
//     },
//   },
// });

// ============================================
// ROUTE HANDLERS
// ============================================

export async function templateRoutes(app: FastifyInstance): Promise<void> {
  // Example: GET /entities
  // app.get('/entities', async (request, reply) => {
  //   const query = paginationQuerySchema.parse(request.query);
  //   const entities = await entityService.findMany(query);
  //   return reply.send({ success: true, data: entities });
  // });

  // Example: POST /entities (authenticated)
  // app.post(
  //   '/entities',
  //   { preHandler: [authenticate] },
  //   async (request, reply) => {
  //     const data = createEntitySchema.parse(request.body);
  //     const entity = await entityService.create(data);
  //     return reply.status(201).send({ success: true, data: entity });
  //   }
  // );
}
