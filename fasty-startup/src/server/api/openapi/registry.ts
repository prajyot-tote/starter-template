import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Extend Zod with OpenAPI support
extendZodWithOpenApi(z);

// Create a single registry for all API endpoints
export const registry = new OpenAPIRegistry();

// Register common components
registry.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'JWT Authorization header',
});

// Standard error response schema
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

registry.register('ErrorResponse', errorResponseSchema);

// Standard success response wrapper
export function successResponse<T extends z.ZodType>(schema: T) {
  return z.object({
    success: z.literal(true),
    data: schema,
  });
}

// Pagination schemas
export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20).openapi({
    description: 'Number of items to return',
    example: 20,
  }),
  offset: z.coerce.number().int().min(0).default(0).openapi({
    description: 'Number of items to skip',
    example: 0,
  }),
});

export const paginationMetaSchema = z.object({
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
  hasMore: z.boolean(),
});

registry.register('PaginationQuery', paginationQuerySchema);
registry.register('PaginationMeta', paginationMetaSchema);

// Generate OpenAPI document
export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'API',
      version: '1.0.0',
      description: 'REST API with OpenAPI specification',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    security: [{ BearerAuth: [] }],
  });
}
