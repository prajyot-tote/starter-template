import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import {
  userSchema,
  userResponseSchema,
  createUserSchema,
  updateUserSchema,
  userIdSchema,
} from '@/schemas';
import { userService } from '@/server/services';
import {
  registry,
  successResponse,
  errorResponseSchema,
  paginationQuerySchema,
  paginationMetaSchema,
} from '../openapi/registry';
import { authenticate, requireRole } from '../middleware';

// ============================================
// OPENAPI SCHEMA REGISTRATION
// ============================================

// Register schemas for OpenAPI
registry.register('User', userResponseSchema);
registry.register('CreateUser', createUserSchema);
registry.register('UpdateUser', updateUserSchema);

// List users response
const listUsersResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(userResponseSchema),
  meta: paginationMetaSchema,
});

// GET /users
registry.registerPath({
  method: 'get',
  path: '/users',
  tags: ['Users'],
  summary: 'List all users',
  description: 'Returns a paginated list of users',
  request: {
    query: paginationQuerySchema,
  },
  responses: {
    200: {
      description: 'List of users',
      content: {
        'application/json': {
          schema: listUsersResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// GET /users/:id
registry.registerPath({
  method: 'get',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Get user by ID',
  description: 'Returns a single user by their ID',
  request: {
    params: userIdSchema,
  },
  responses: {
    200: {
      description: 'User found',
      content: {
        'application/json': {
          schema: successResponse(userResponseSchema),
        },
      },
    },
    404: {
      description: 'User not found',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// POST /users
registry.registerPath({
  method: 'post',
  path: '/users',
  tags: ['Users'],
  summary: 'Create a new user',
  description: 'Creates a new user with the provided data',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User created',
      content: {
        'application/json': {
          schema: successResponse(userResponseSchema),
        },
      },
    },
    400: {
      description: 'Validation error',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    409: {
      description: 'Email already exists',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// PUT /users/:id
registry.registerPath({
  method: 'put',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Update a user',
  description: 'Updates an existing user',
  request: {
    params: userIdSchema,
    body: {
      content: {
        'application/json': {
          schema: updateUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User updated',
      content: {
        'application/json': {
          schema: successResponse(userResponseSchema),
        },
      },
    },
    404: {
      description: 'User not found',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// DELETE /users/:id
registry.registerPath({
  method: 'delete',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Delete a user',
  description: 'Deletes a user (admin only)',
  security: [{ BearerAuth: [] }],
  request: {
    params: userIdSchema,
  },
  responses: {
    200: {
      description: 'User deleted',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({ deleted: z.boolean() }),
          }),
        },
      },
    },
    404: {
      description: 'User not found',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// ============================================
// ROUTE HANDLERS
// ============================================

export async function userRoutes(app: FastifyInstance): Promise<void> {
  // GET /users - List users (public)
  app.get('/users', async (request, reply) => {
    const query = paginationQuerySchema.parse(request.query);
    const users = await userService.findMany(query);
    const total = await userService.count();

    return reply.send({
      success: true,
      data: users,
      meta: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + users.length < total,
      },
    });
  });

  // GET /users/:id - Get single user (public)
  app.get('/users/:id', async (request, reply) => {
    const { id } = userIdSchema.parse(request.params);
    const user = await userService.findById(id);

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    return reply.send({
      success: true,
      data: user,
    });
  });

  // POST /users - Create user (public for registration)
  app.post('/users', async (request, reply) => {
    const data = createUserSchema.parse(request.body);

    // Check for existing email
    const existing = await userService.findByEmail(data.email);
    if (existing) {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already in use',
        },
      });
    }

    const user = await userService.create(data);

    return reply.status(201).send({
      success: true,
      data: user,
    });
  });

  // PUT /users/:id - Update user (authenticated)
  app.put(
    '/users/:id',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = userIdSchema.parse(request.params);
      const data = updateUserSchema.parse(request.body);

      const exists = await userService.exists(id);
      if (!exists) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      const user = await userService.update(id, data);

      return reply.send({
        success: true,
        data: user,
      });
    }
  );

  // DELETE /users/:id - Delete user (admin only)
  app.delete(
    '/users/:id',
    { preHandler: [authenticate, requireRole(['ADMIN'])] },
    async (request, reply) => {
      const { id } = userIdSchema.parse(request.params);

      const exists = await userService.exists(id);
      if (!exists) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      await userService.delete(id);

      return reply.send({
        success: true,
        data: { deleted: true },
      });
    }
  );
}
