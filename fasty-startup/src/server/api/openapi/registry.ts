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
export function successResponse<T extends z.ZodType>(schema: T): z.ZodObject<{
  success: z.ZodLiteral<true>;
  data: T;
}> {
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
export function generateOpenAPIDocument(): ReturnType<OpenApiGeneratorV3['generateDocument']> {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  const port = process.env['PORT'] ?? '3000';
  const apiUrl = process.env['API_URL'] ?? `http://localhost:${port}`;
  const isDev = process.env['NODE_ENV'] !== 'production';

  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'API',
      version: '1.0.0',
      description: 'REST API with OpenAPI specification',
    },
    servers: [
      {
        url: apiUrl,
        description: isDev ? 'Development server' : 'Production server',
      },
    ],
    security: [{ BearerAuth: [] }],
  });
}
