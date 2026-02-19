# Next.js Starter Template

A minimal, production-ready Next.js starter with App Router, Prisma, and Zod validation.

## Features

- **Next.js 14** with App Router and React Server Components
- **API Routes** built into Next.js (no separate backend)
- **Type-safe** end-to-end (Prisma → Zod → TypeScript)
- **Zod validation** shared between frontend and backend
- **Architecture enforcement** via dependency-cruiser
- **Clean separation** of client and server code

---

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Start development server
npm run dev

# Open the app
open http://localhost:3000
```

## Project Structure

```
src/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles
│   └── api/                     # API routes
│       └── health/route.ts      # Health check endpoint
│
├── server/                      # Backend code (server-only)
│   ├── db/                      # Prisma client singleton
│   │   └── client.ts
│   └── errors/                  # AppError class
│
├── client/                      # Frontend code (browser-safe)
│   ├── components/              # React components
│   │   └── ui/                  # Reusable UI components
│   ├── hooks/                   # React hooks
│   └── api/                     # API client
│       └── client.ts            # Type-safe fetch wrapper
│
├── shared/                      # Code used by both client & server
│   ├── types/                   # Shared TypeScript types
│   └── utils/                   # Utility functions
│
└── schemas/                     # Shared Zod validation schemas
    ├── _template.schema.ts      # Template for new schemas
    └── index.ts

prisma/
└── schema.prisma                # Database schema
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   Prisma Schema ──▶ Zod Schemas ──▶ API Routes ──▶ React Components    │
│         │                │               │                │             │
│         ▼                ▼               ▼                ▼             │
│   Database Types    Validation      Services        Type-safe UI       │
│                                                                         │
│   Single source of truth ──────────────────────────▶ Type safety       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Layer Boundaries (enforced by dependency-cruiser):
- src/client/ CANNOT import from src/server/
- src/server/ CANNOT import from src/client/
- src/schemas/ and src/shared/ are pure (no app/client/server imports)
```

---

## How This Template Enforces Consistency

### 1. Enforced Architecture Boundaries

The `.dependency-cruiser.js` configuration prevents architectural violations:

| Rule | What It Prevents |
|------|------------------|
| `no-client-importing-server` | Frontend code accessing database directly |
| `no-server-importing-client` | Backend depending on React components |
| `schemas-must-be-pure` | Schemas importing side-effect code |
| `shared-must-be-pure` | Utilities importing app-specific code |
| `no-direct-prisma-in-client` | Client code importing Prisma |
| `no-circular-dependencies` | Circular import chains |

**If you break a rule, `npm run arch:validate` fails.**

### 2. Strict TypeScript

From `tsconfig.json`:
- `strict: true` — No implicit any, null safety enforced
- `noUncheckedIndexedAccess: true` — Array access returns `T | undefined`
- `noImplicitReturns: true` — All code paths must return

### 3. FAT Services, THIN Routes

- **Services** contain ALL business logic (validation, DB queries, domain rules)
- **Routes** only handle HTTP concerns (parsing request, returning response)

---

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

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive(),
});

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
  async create(data: CreateProduct) { return db.product.create({ data }); },
};
```

Export from `src/server/services/index.ts`.

### 4. Create API Routes

```typescript
// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { productService } from '@/server/services';
import { createProductSchema } from '@/schemas';

export async function GET() {
  const products = await productService.findMany();
  return NextResponse.json({ success: true, data: products });
}

export async function POST(request: Request) {
  const body = await request.json();
  const data = createProductSchema.parse(body);
  const product = await productService.create(data);
  return NextResponse.json({ success: true, data: product }, { status: 201 });
}
```

### 5. Create Hook (Frontend)

```typescript
// src/client/hooks/useProducts.ts
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  // ... fetch from /api/products
  return { products, isLoading, error };
}
```

### 6. Verify

```bash
npm run validate
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | ESLint validation |
| `npm run typecheck` | TypeScript validation |
| `npm run arch:validate` | Architecture validation |
| `npm run validate` | All validations + tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create migration |
| `npm run db:studio` | Open Prisma Studio |

## API Response Format

### Success

```json
{
  "success": true,
  "data": { "id": "...", "name": "..." }
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
| `NODE_ENV` | Environment | development |

## Tech Stack

- **Next.js** ^14.2 - React framework with App Router
- **Prisma** ^5.22 - Database ORM
- **Zod** ^3.23 - Schema validation
- **TypeScript** ^5.5 - Type safety
- **Vitest** ^1.6 - Testing framework
- **dependency-cruiser** ^16 - Architecture enforcement

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set up authentication (NextAuth, etc.)
- [ ] Configure proper CORS if needed
- [ ] Set up monitoring (Vercel Analytics, etc.)
- [ ] Configure database connection pooling
- [ ] Deploy to Vercel, Railway, or similar
