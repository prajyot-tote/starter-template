# Fastify Starter Template

A production-ready, type-safe REST API template with Fastify, OpenAPI, and Prisma.

## Features

- **Fastify** - High-performance HTTP server
- **OpenAPI 3.0** - Auto-generated spec from Zod schemas
- **Swagger UI** - Interactive API docs at `/docs`
- **Type-safe** - End-to-end (Prisma → Zod → OpenAPI → TypeScript)
- **Zod validation** - Shared between frontend and backend
- **Security** - Helmet, CORS, rate limiting built-in
- **Architecture enforcement** - Dependency-cruiser prevents violations

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Generate Prisma client and push schema
npm run db:generate
npm run db:push

# Start development server
npm run dev

# Open API docs
open http://localhost:3000/docs
```

## Project Structure

```
src/
├── schemas/                 # Shared Zod schemas (FE + BE)
│   ├── _template.schema.ts  # Template for new schemas
│   └── index.ts
│
├── server/
│   ├── db/                  # Prisma client singleton
│   ├── services/            # Business logic (FAT)
│   └── api/
│       ├── routes/          # REST endpoints (THIN)
│       │   ├── health.routes.ts
│       │   ├── _template.routes.ts
│       │   └── index.ts
│       ├── middleware/      # Auth, error handling
│       └── openapi/         # OpenAPI generation
│
├── client/
│   ├── api/                 # Generated types from OpenAPI
│   ├── components/
│   └── hooks/
│
└── shared/
    ├── errors/              # AppError class
    ├── types/               # Shared TypeScript types
    └── utils/               # Pure utility functions
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   Prisma Schema ──▶ Zod Schemas ──▶ OpenAPI Spec ──▶ TypeScript Types  │
│         │                │               │                │             │
│         ▼                ▼               ▼                ▼             │
│   Database Types    Validation      Swagger UI      FE API Client      │
│                                                                         │
│   Single source of truth ──────────────────────────▶ Type safety       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Principles

### 1. Services Are FAT, Routes Are THIN

All business logic lives in services. Routes only handle HTTP concerns.

```typescript
// ✅ Service (FAT) - contains business logic
export const userService = {
  async create(data: CreateUser) {
    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) throw AppError.conflict('Email exists');
    return db.user.create({ data });
  },
};

// ✅ Route (THIN) - only HTTP concerns
app.post('/users', async (req, reply) => {
  const data = createUserSchema.parse(req.body);
  const user = await userService.create(data);
  return reply.status(201).send({ success: true, data: user });
});
```

### 2. OpenAPI Is The Contract

Every endpoint is documented in OpenAPI. The spec is auto-generated from Zod schemas.

```typescript
registry.registerPath({
  method: 'post',
  path: '/users',
  tags: ['Users'],
  request: { body: { content: { 'application/json': { schema: createUserSchema } } } },
  responses: { 201: { content: { 'application/json': { schema: userSchema } } } },
});
```

### 3. Zod Schemas Are Shared

Same schemas validate on backend and frontend:

```typescript
// src/schemas/user.schema.ts
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

// Backend: validates request
const data = createUserSchema.parse(req.body);

// Frontend: validates form
const form = useForm({ resolver: zodResolver(createUserSchema) });
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production (tsup) |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create migration |
| `npm run db:studio` | Open Prisma Studio |
| `npm run api:generate` | Generate OpenAPI spec + client types |
| `npm run typecheck` | TypeScript validation |
| `npm run lint` | ESLint validation |
| `npm run arch:validate` | Architecture validation |
| `npm run validate` | All validations + tests |

## Adding a New Entity

### 1. Add Prisma Model

```prisma
// prisma/schema.prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  price       Decimal  @db.Decimal(10, 2)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

```bash
npm run db:generate
npm run db:push
```

### 2. Create Zod Schema

```typescript
// src/schemas/product.schema.ts
import { z } from 'zod';

export const productSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createProductSchema = productSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Product = z.infer<typeof productSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
```

Export from `src/schemas/index.ts`.

### 3. Create Service

```typescript
// src/server/services/product.service.ts
import { db } from '@/server/db';
import type { CreateProduct } from '@/schemas';

export const productService = {
  async findMany() { return db.product.findMany(); },
  async findById(id: string) { return db.product.findUnique({ where: { id } }); },
  async create(data: CreateProduct) { return db.product.create({ data }); },
};
```

Export from `src/server/services/index.ts`.

### 4. Create Routes

Copy `src/server/api/routes/_template.routes.ts` to `product.routes.ts` and implement.

### 5. Generate OpenAPI

```bash
npm run api:generate
```

### 6. Verify

```bash
npm run validate
open http://localhost:3000/docs
```

## API Response Format

### Success

```json
{
  "success": true,
  "data": { "id": "...", "name": "..." }
}
```

### Success (List with Pagination)

```json
{
  "success": true,
  "data": [{ "id": "...", "name": "..." }],
  "meta": { "total": 100, "limit": 20, "offset": 0, "hasMore": true }
}
```

### Error

```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Resource not found" }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | 3000 |
| `HOST` | Server host | 0.0.0.0 |
| `NODE_ENV` | Environment | development |
| `LOG_LEVEL` | Pino log level | info |
| `CORS_ORIGIN` | Allowed origins | * (dev) |
| `API_URL` | OpenAPI server URL | http://localhost:PORT |

## Built-in Security

- **Helmet** - Security headers (CSP, HSTS, etc.)
- **CORS** - Configurable cross-origin policy
- **Rate Limiting** - 100 requests/minute by default

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGIN` properly
- [ ] Configure authentication (JWT middleware included)
- [ ] Set up monitoring and logging
- [ ] Configure database connection pooling
- [ ] Set up health checks for load balancer

## Tech Stack

- **Fastify** ^4.28 - HTTP server
- **Prisma** ^5.22 - Database ORM
- **Zod** ^3.23 - Schema validation
- **TypeScript** ^5.5 - Type safety
- **tsup** - Production bundler
- **Vitest** - Testing framework
