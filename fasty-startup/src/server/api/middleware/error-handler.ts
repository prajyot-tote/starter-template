import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

import { AppError } from '@/shared/errors';

/**
 * Global error handler for Fastify
 *
 * Transforms errors into consistent API response format.
 */
export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  // Log error for debugging
  request.log.error(error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
    });
    return;
  }

  // Handle custom application errors
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  // Handle Fastify validation errors
  if (error.validation) {
    reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.validation,
      },
    });
    return;
  }

  // Handle known HTTP errors
  if (error.statusCode && error.statusCode < 500) {
    reply.status(error.statusCode).send({
      success: false,
      error: {
        code: 'REQUEST_ERROR',
        message: error.message,
      },
    });
    return;
  }

  // Handle unknown errors (500)
  const isProduction = process.env.NODE_ENV === 'production';
  reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction
        ? 'An unexpected error occurred'
        : error.message || 'Unknown error',
    },
  });
}
