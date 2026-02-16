import { z } from 'zod';

import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
} from '@/schemas';
import { userService } from '@/server/services';

// ============================================
// USER ROUTER EXAMPLE
// ============================================
// This shows the pattern - adapt to your API framework
// (tRPC, Fastify, Express, Hono, etc.)
//
// Key points:
// 1. Input validation uses shared Zod schemas
// 2. Business logic delegated to services
// 3. Router is thin - just wiring
// ============================================

// Example handlers (adapt to your framework)
export const userHandlers = {
  getById: {
    input: userIdSchema,
    handler: async (input: z.infer<typeof userIdSchema>) => {
      const user = await userService.findById(input.id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    },
  },

  list: {
    input: z.object({
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
    }),
    handler: async (input: { limit: number; offset: number }) => {
      return userService.findMany(input);
    },
  },

  create: {
    input: createUserSchema,
    handler: async (input: z.infer<typeof createUserSchema>) => {
      // Check if email already exists
      const existing = await userService.findByEmail(input.email);
      if (existing) {
        throw new Error('Email already in use');
      }
      return userService.create(input);
    },
  },

  update: {
    input: z.object({
      id: z.string().cuid(),
      data: updateUserSchema,
    }),
    handler: async (input: { id: string; data: z.infer<typeof updateUserSchema> }) => {
      const exists = await userService.exists(input.id);
      if (!exists) {
        throw new Error('User not found');
      }
      return userService.update(input.id, input.data);
    },
  },

  delete: {
    input: userIdSchema,
    handler: async (input: z.infer<typeof userIdSchema>) => {
      const exists = await userService.exists(input.id);
      if (!exists) {
        throw new Error('User not found');
      }
      return userService.delete(input.id);
    },
  },
};
