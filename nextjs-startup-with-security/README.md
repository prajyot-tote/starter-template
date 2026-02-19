# Next.js Starter with Security

A production-ready Next.js starter with **built-in authentication and role-based access control (RBAC)**.

## Features

- **Authentication**: Register, login, logout with JWT sessions
- **Role-Based Access Control**: Roles with permission arrays
- **Permission System**: Fine-grained permissions with wildcard support
- **Route Protection**: Backend middleware + frontend route guards
- **UI Gates**: `<PermissionGate>` and `<RoleGate>` components
- **Multi-Organization**: Support for org-scoped roles (optional)
- **Type-Safe**: Full TypeScript support throughout
- **Architecture Enforcement**: Dependency-cruiser prevents violations

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma (PostgreSQL)
- Zod validation
- Jose (JWT)

---

## Quick Start

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
JWT_SECRET="your-secret-key-min-32-chars-long"
```

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

### 3. Setup Database

```bash
npm run setup
```

This runs: `npm install` → `db:generate` → `db:push` → `db:seed`

### 4. Start Development

```bash
npm run dev
```

Visit http://localhost:3000

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/              # Auth endpoints (login, register, etc.)
│   │   ├── roles/             # Role management
│   │   └── health/
│   ├── (auth)/                # Public auth pages
│   │   ├── login/
│   │   └── register/
│   ├── (protected)/           # Protected pages
│   │   └── dashboard/
│   └── unauthorized/
│
├── config/
│   └── route-permissions.ts   # ← CUSTOMIZE THIS
│
├── lib/
│   └── permissions/           # Permission system core
│
├── server/
│   ├── auth/                  # Auth middleware, JWT, passwords
│   ├── db/
│   └── services/
│
└── client/
    ├── components/auth/       # PermissionGate, RoleGate, RouteGuard
    ├── hooks/                 # usePermissions, useCheckRole, etc.
    └── lib/                   # AuthContext, permission service
```

---

## Usage Guide

### 1. Protecting API Routes

Use the `withAuth` middleware:

```typescript
// src/app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/server/auth';

async function handler(request: AuthenticatedRequest) {
  const { auth } = request;
  // auth: { userId, email, roles, permissions, organizationId }

  return NextResponse.json({ data: 'protected' });
}

export const GET = withAuth(handler);
```

### 2. Registering Route Permissions

Edit `src/config/route-permissions.ts`:

```typescript
export const ROUTE_PERMISSIONS: RoutePermissionEntry[] = [
  // Public
  { method: 'GET', path: '/api/health', permission: null },

  // Any logged-in user
  { method: 'GET', path: '/api/profile', permission: 'authenticated' },

  // Specific permission
  { method: 'GET', path: '/api/projects', permission: 'projects:read:all' },

  // ANY of these permissions
  { method: 'GET', path: '/api/users', permission: { any: ['users:read:all', 'admin:access:all'] } },

  // ALL of these permissions
  { method: 'DELETE', path: '/api/admin/purge', permission: { all: ['admin:access:all', 'system:admin:all'] } },
];
```

### 3. Protecting Pages

Use `RouteGuard`:

```tsx
import { RouteGuard } from '@/client/components/auth';

export default function AdminPage() {
  return (
    <RouteGuard permission="admin:access:all">
      <AdminDashboard />
    </RouteGuard>
  );
}

// Or role-based:
export default function SettingsPage() {
  return (
    <RouteGuard role="Admin">
      <Settings />
    </RouteGuard>
  );
}
```

### 4. Conditional UI Rendering

**Permission-based:**

```tsx
import { PermissionGate } from '@/client/components/auth';

<PermissionGate require="projects:create:all">
  <button>Create Project</button>
</PermissionGate>

<PermissionGate
  requireAny={['billing:read:all', 'admin:access:all']}
  fallback={<p>No access</p>}
>
  <BillingPanel />
</PermissionGate>
```

**Role-based:**

```tsx
import { RoleGate } from '@/client/components/auth';

<RoleGate require="Admin">
  <AdminPanel />
</RoleGate>

<RoleGate requireAny={['Admin', 'Developer']}>
  <DevTools />
</RoleGate>
```

### 5. Using Hooks

```tsx
import { useCheckPermission, useCheckRole } from '@/client/hooks';

function MyComponent() {
  const { allowed: canCreate } = useCheckPermission('projects:create:all');
  const { allowed: isAdmin } = useCheckRole('Admin');

  return (
    <div>
      {canCreate && <button>Create</button>}
      {isAdmin && <button>Admin Action</button>}
    </div>
  );
}
```

---

## Permission Format

Permissions follow: `resource:action:scope`

Examples:
- `projects:read:all` - Read all projects
- `users:manage:all` - Manage all users
- `admin:access:all` - Access admin panel

### Wildcards

- `*` - Full access
- `projects:*:all` - All actions on projects
- `*:read:all` - Read access to everything

---

## Default Roles (after seed)

| Role | Permissions |
|------|-------------|
| Platform Admin | `*` (full access) |
| Admin | projects, users, settings, admin |
| Developer | projects (CRUD), users (read) |
| Viewer | projects (read), users (read) |
| User | projects (read) |

---

## Adding Permissions & Roles

Edit `prisma/seed.ts` and run:

```bash
npm run db:seed
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run setup` | Full setup (install, generate, push, seed) |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed roles and permissions |
| `npm run db:studio` | Open Prisma Studio |
| `npm run validate` | Run all checks |

---

## Auth Flow

```
Backend:
1. Request → withAuth middleware
2. Find route in ROUTE_PERMISSIONS
3. Validate JWT token
4. Resolve permissions (roles + direct grants)
5. Check requirement → allow or 403
6. Attach auth context → handler

Frontend:
1. Login → session token stored in cookie
2. AuthProvider fetches user
3. usePermissions fetches permission JWT
4. RouteGuard/Gates use permissions for UI
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (required) |
| `JWT_SECRET` | JWT signing secret, min 32 chars (required) |
| `NODE_ENV` | development / production |

---

## License

MIT
