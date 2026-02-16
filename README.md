# Starter Template

A type-safe, schema-first project template with maximum compile-time safety.

## What's Pre-Configured (Static)

| File | Purpose | Change Frequency |
|------|---------|------------------|
| `tsconfig.json` | Maximum TypeScript strictness | Never |
| `eslint.config.js` | Code style + naming conventions | Rarely |
| `.dependency-cruiser.js` | Architecture boundary enforcement | Rarely |
| `.prettierrc` | Code formatting | Never |

## What You Must Define (Dynamic)

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Your database models |
| `src/schemas/*.ts` | Your validation rules (Zod) |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# 3. Generate Prisma client
npm run db:generate

# 4. Push schema to database (development)
npm run db:push

# 5. Run development server
npm run dev
```

## Project Structure

```
src/
├── schemas/           # Shared Zod schemas (FE + BE)
│   ├── index.ts       # Export all schemas
│   ├── user.schema.ts # User validation
│   └── _template.schema.ts  # Copy for new entities
│
├── server/
│   ├── db/            # Prisma client
│   ├── services/      # Business logic
│   └── api/routers/   # API endpoints
│
├── client/
│   ├── components/    # UI components
│   ├── hooks/         # Custom hooks
│   └── api/           # Generated API client
│
└── shared/
    ├── types/         # Shared TypeScript types
    └── utils/         # Pure utility functions
```

## Commands

```bash
# Development
npm run dev              # Start dev server
npm run typecheck        # Type check without emitting

# Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
npm run arch:validate    # Validate architecture rules
npm run validate         # Run all checks

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema (dev only)
npm run db:migrate       # Create migration
npm run db:studio        # Open Prisma Studio

# Testing
npm run test             # Run tests
npm run test:coverage    # Run with coverage
```

## Architecture Rules

The following rules are enforced by dependency-cruiser:

1. **client/** cannot import from **server/** (and vice versa)
2. **schemas/** cannot import from client or server (must be pure)
3. **shared/** cannot import from client or server (must be pure)
4. No circular dependencies anywhere
5. Client code cannot import Prisma directly

Run `npm run arch:validate` to check. Run `npm run arch:visualize` to generate a diagram.

## Adding a New Entity

1. **Add Prisma model** in `prisma/schema.prisma`
2. **Run** `npm run db:generate`
3. **Copy** `src/schemas/_template.schema.ts` to `src/schemas/yourEntity.schema.ts`
4. **Export** from `src/schemas/index.ts`
5. **Create** service in `src/server/services/`
6. **Create** router in `src/server/api/routers/`

## Type Safety Guarantees

- **TypeScript strict mode**: Catches null/undefined errors
- **Zod schemas**: Runtime validation with inferred types
- **Prisma types**: Database queries are type-checked
- **ESLint**: Naming conventions enforced
- **dependency-cruiser**: Layer violations caught in CI
