// ============================================
// PERMISSION SERVICE (Client-side)
// ============================================

const PERMISSION_TOKEN_KEY = 'app_permission_token';

export interface PermissionTokenPayload {
  sub: string;
  org?: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

/**
 * Fetch permission JWT from server and store it
 */
export async function fetchAndStorePermissions(
  organizationId?: string
): Promise<{ roles: string[]; permissions: string[] }> {
  try {
    const headers: Record<string, string> = {};
    if (organizationId) {
      headers['x-organization-id'] = organizationId;
    }

    const response = await fetch('/api/auth/permissions', {
      headers,
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      return { roles: [], permissions: [] };
    }

    const json = (await response.json()) as {
      data?: { token: string };
    };
    const token = json.data?.token;

    if (!token) {
      return { roles: [], permissions: [] };
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(PERMISSION_TOKEN_KEY, token);
    }

    // Decode roles/permissions from the token
    const payload = decodeTokenPayload(token);
    return {
      roles: payload?.roles ?? [],
      permissions: payload?.permissions ?? [],
    };
  } catch {
    return { roles: [], permissions: [] };
  }
}

/**
 * Decode JWT payload without verification (for client-side use)
 */
function decodeTokenPayload(token: string): PermissionTokenPayload | null {
  try {
    const [, payloadB64] = token.split('.');
    if (!payloadB64) return null;
    return JSON.parse(atob(payloadB64)) as PermissionTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Get decoded payload from cached JWT (synchronous)
 */
export function getPermissionPayload(): PermissionTokenPayload | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem(PERMISSION_TOKEN_KEY);
  if (!token) return null;

  const payload = decodeTokenPayload(token);
  if (!payload) {
    localStorage.removeItem(PERMISSION_TOKEN_KEY);
    return null;
  }

  // Check expiration
  if (payload.exp && payload.exp < Date.now() / 1000) {
    localStorage.removeItem(PERMISSION_TOKEN_KEY);
    return null;
  }

  return payload;
}

/**
 * Get permission keys from cached JWT
 */
export function getPermissionKeys(): string[] {
  return getPermissionPayload()?.permissions ?? [];
}

/**
 * Get role names from cached JWT
 */
export function getRoleNames(): string[] {
  return getPermissionPayload()?.roles ?? [];
}

/**
 * Clear permissions on logout
 */
export function clearPermissions(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PERMISSION_TOKEN_KEY);
  }
}

/**
 * Check if permissions are cached
 */
export function hasPermissionCache(): boolean {
  return getPermissionPayload() !== null;
}
