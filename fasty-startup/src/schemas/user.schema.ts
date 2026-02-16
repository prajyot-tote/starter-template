import { z } from 'zod';

// ============================================
// USER SCHEMAS
// ============================================
// Must align with prisma/schema.prisma User model
// Update this when you change the Prisma model
// ============================================

// Enum matching Prisma Role enum
export const roleSchema = z.enum(['USER', 'ADMIN']);
export type Role = z.infer<typeof roleSchema>;

// Base user schema (matches Prisma model)
export const userSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100).nullable(),
  role: roleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// For API responses (dates as strings for JSON)
export const userResponseSchema = userSchema.extend({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// For creating a user (no id, timestamps auto-generated)
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100).optional(),
  role: roleSchema.optional(), // Defaults to USER in Prisma
});

// For updating a user (all fields optional)
export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  name: z.string().min(1).max(100).nullable().optional(),
  role: roleSchema.optional(),
});

// For queries by ID
export const userIdSchema = z.object({
  id: z.string().cuid('Invalid user ID'),
});

// For queries by email
export const userEmailSchema = z.object({
  email: z.string().email(),
});

// ============================================
// INFERRED TYPES
// ============================================
// Use these instead of manually writing interfaces
// They're guaranteed to match the schemas above

export type User = z.infer<typeof userSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UserId = z.infer<typeof userIdSchema>;
