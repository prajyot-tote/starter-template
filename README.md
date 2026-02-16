# Starter Templates

Production-ready, type-safe full-stack TypeScript starter templates.

## Available Templates

| Template | Description |
|----------|-------------|
| [fasty-startup](./fasty-startup/) | Fastify backend with OpenAPI, Prisma, Zod |
| [nextjs-startup](./nextjs-startup/) | Next.js App Router with API routes, Prisma, Zod |

## Quick Start

```bash
# Copy the template you want
cp -r fasty-startup/ ../my-new-project
# OR
cp -r nextjs-startup/ ../my-new-project

cd ../my-new-project
npm install
```

## Common Features

Both templates include:
- **TypeScript** with strict mode
- **Prisma ORM** for database access
- **Zod validation** shared between frontend/backend
- **Architecture enforcement** via dependency-cruiser
- **Client/Server separation** enforced at build time

## Choosing a Template

| Use Case | Template |
|----------|----------|
| API-only backend, separate frontend | `fasty-startup` |
| Full-stack with React SSR | `nextjs-startup` |
| OpenAPI/Swagger documentation | `fasty-startup` |
| Vercel deployment | `nextjs-startup` |
