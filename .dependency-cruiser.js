/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    // ============================================
    // LAYER BOUNDARY RULES
    // ============================================
    {
      name: 'no-client-importing-server',
      comment: 'Client code cannot import server code (DB, API internals)',
      severity: 'error',
      from: { path: '^src/client' },
      to: { path: '^src/server' },
    },
    {
      name: 'no-server-importing-client',
      comment: 'Server code should not depend on client code',
      severity: 'error',
      from: { path: '^src/server' },
      to: { path: '^src/client' },
    },
    {
      name: 'schemas-must-be-pure',
      comment: 'Schemas should not import from client or server (they are shared)',
      severity: 'error',
      from: { path: '^src/schemas' },
      to: { path: '^src/(client|server)' },
    },
    {
      name: 'shared-must-be-pure',
      comment: 'Shared utilities should not import from client or server',
      severity: 'error',
      from: { path: '^src/shared' },
      to: { path: '^src/(client|server)' },
    },

    // ============================================
    // SERVER LAYER RULES
    // ============================================
    {
      name: 'routers-use-services-not-db-directly',
      comment: 'API routers should use services, not access DB directly (optional - remove if too strict)',
      severity: 'warn',
      from: { path: '^src/server/api/routers' },
      to: { path: '^src/server/db' },
    },
    {
      name: 'services-dont-import-routers',
      comment: 'Services should not know about routers',
      severity: 'error',
      from: { path: '^src/server/services' },
      to: { path: '^src/server/api/routers' },
    },
    {
      name: 'db-layer-is-isolated',
      comment: 'DB layer should not import from other server layers',
      severity: 'error',
      from: { path: '^src/server/db' },
      to: { path: '^src/server/(api|services)' },
    },

    // ============================================
    // CLIENT LAYER RULES
    // ============================================
    {
      name: 'components-dont-import-hooks-internals',
      comment: 'Components should use hooks via public API, not internals',
      severity: 'warn',
      from: { path: '^src/client/components' },
      to: { path: '^src/client/hooks/.*\\.internal\\.ts$' },
    },

    // ============================================
    // CIRCULAR DEPENDENCY RULES
    // ============================================
    {
      name: 'no-circular-dependencies',
      comment: 'Circular dependencies are forbidden',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-circular-at-module-level',
      comment: 'No circular dependencies between top-level modules',
      severity: 'error',
      from: { path: '^src/[^/]+' },
      to: {
        circular: true,
        path: '^src/[^/]+',
      },
    },

    // ============================================
    // DEPENDENCY HYGIENE
    // ============================================
    {
      name: 'no-orphan-modules',
      comment: 'Modules should be imported somewhere (except entry points)',
      severity: 'warn',
      from: { orphan: true, pathNot: [
        '\\.test\\.ts$',
        '\\.spec\\.ts$',
        'index\\.ts$',
        '^src/server/index\\.ts$',
        '^src/client/index\\.ts$',
      ]},
      to: {},
    },
    {
      name: 'no-deprecated-modules',
      comment: 'Do not import from deprecated modules',
      severity: 'warn',
      from: {},
      to: { path: '\\.deprecated\\.' },
    },

    // ============================================
    // EXTERNAL DEPENDENCY RULES
    // ============================================
    {
      name: 'no-direct-prisma-in-client',
      comment: 'Client code should never import Prisma directly',
      severity: 'error',
      from: { path: '^src/client' },
      to: { path: '@prisma/client|prisma' },
    },
  ],

  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: './tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/(@[^/]+/[^/]+|[^/]+)',
      },
      text: {
        highlightFocused: true,
      },
    },
  },
};
