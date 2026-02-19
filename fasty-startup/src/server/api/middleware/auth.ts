import type { FastifyRequest, FastifyReply } from 'fastify';

// ============================================
// AUTH MIDDLEWARE TEMPLATE
// ============================================
// Customize this for your authentication needs
// ============================================

// Define your user type here or import from @/schemas
// import type { User } from '@/schemas';
interface AuthUser {
  id: string;
  role: string;
}

// Extend Fastify request type to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

/**
 * Authentication middleware
 *
 * Verifies JWT token and attaches user to request.
 * Replace the token verification logic with your actual implementation.
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header',
      },
    });
  }

  const token = authHeader.slice(7);

  try {
    // TODO: Replace with your actual token verification
    // Example: const payload = await verifyJWT(token);
    // Example: const user = await db.user.findUnique({ where: { id: payload.userId } });

    // Placeholder implementation
    if (!token) {
      throw new Error('Invalid token');
    }

    // Attach user to request
    // request.user = user;
  } catch {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    });
  }
}

/**
 * Authorization middleware factory
 *
 * Creates middleware that checks if user has required role.
 * Update the role type to match your schema.
 */
export function requireRole(roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
    }
  };
}
