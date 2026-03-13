# Starter Templates

Production-ready, type-safe full-stack TypeScript starter templates.

## Available Templates

| Template | Description |
|----------|-------------|
| [fasty-startup](./fasty-startup/) | Fastify backend with OpenAPI, Prisma, Zod |
| [nextjs-startup](./nextjs-startup/) | Next.js App Router with API routes, Prisma, Zod |
| [nextjs-startup-with-security](./nextjs-startup-with-security/) | Next.js + authentication, RBAC, permission system |
| [nextjs-startup-with-security-config](./nextjs-startup-with-security-config/) | Next.js + auth, RBAC, configurable security, setup wizard with 8 UI framework presets |

## Quick Start

```bash
# Copy the template you want
cp -r nextjs-startup-with-security-config/ ../my-new-project

cd ../my-new-project
npm install
npm run setup    # Interactive wizard
```

## Common Features

All templates include:
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
| Auth + RBAC + permissions | `nextjs-startup-with-security` |
| Auth + RBAC + configurable security + UI presets | `nextjs-startup-with-security-config` |
