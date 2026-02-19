// ============================================
// SECURITY CONFIGURATION
// ============================================
// Edit these settings to configure security features.
// All features are opt-in and disabled by default.
// Run `npm run setup` to configure interactively.

export const security = {
  // ═══════════════════════════════════════════════════════
  // RATE LIMITING
  // Prevents brute force and DDoS attacks
  // ═══════════════════════════════════════════════════════
  rateLimit: {
    enabled: false,
    // Login endpoint: stricter limits
    login: {
      maxAttempts: 5, // Max attempts per window
      windowMs: 60_000, // 1 minute window
    },
    // General API: more lenient
    api: {
      maxAttempts: 100,
      windowMs: 60_000,
    },
  },

  // ═══════════════════════════════════════════════════════
  // ACCOUNT LOCKOUT
  // Lock account after too many failed login attempts
  // ═══════════════════════════════════════════════════════
  lockout: {
    enabled: false,
    maxFailedAttempts: 5, // Lock after this many failures
    lockoutDurationMs: 15 * 60_000, // 15 minutes
    showRemainingAttempts: true, // Warn user on last attempts
  },

  // ═══════════════════════════════════════════════════════
  // PASSWORD REQUIREMENTS
  // Enforce password complexity
  // ═══════════════════════════════════════════════════════
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSymbols: false,
  },

  // ═══════════════════════════════════════════════════════
  // SESSION SECURITY
  // Session management options
  // ═══════════════════════════════════════════════════════
  session: {
    invalidateOnPasswordChange: false, // Logout all devices on password change
    maxConcurrentSessions: null, // null = unlimited, or set a number
  },

  // ═══════════════════════════════════════════════════════
  // AUDIT LOGGING
  // Track security-relevant events
  // ═══════════════════════════════════════════════════════
  audit: {
    enabled: false,
    storage: 'database' as 'database' | 'console',
    events: [
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'LOGOUT',
      'REGISTER',
      'PASSWORD_CHANGED',
      'ACCOUNT_LOCKED',
      'ACCOUNT_UNLOCKED',
    ] as const,
    retentionDays: 90, // Auto-delete after this many days (0 = keep forever)
  },
} as const;

// Type exports for use in other modules
export type SecurityConfig = typeof security;
export type AuditEvent = (typeof security.audit.events)[number];
