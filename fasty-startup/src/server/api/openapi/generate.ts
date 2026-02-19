/* eslint-disable no-console */
/**
 * OpenAPI Spec Generator
 *
 * Run with: npm run openapi:generate
 *
 * This generates openapi.json from the registered routes.
 * After generating, run: npm run client:generate
 * to create TypeScript types for the frontend.
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

// Import all route registrations to populate the registry
// Add your route imports here:
// import '../routes/product.routes';
// import '../routes/order.routes';

import { generateOpenAPIDocument } from './registry';

const spec = generateOpenAPIDocument();
const outputPath = resolve(process.cwd(), 'openapi.json');

writeFileSync(outputPath, JSON.stringify(spec, null, 2));

console.log(`✅ OpenAPI spec generated: ${outputPath}`);
console.log(`\nNext steps:`);
console.log(`  1. Run: npm run client:generate`);
console.log(`  2. Import types from: src/client/api/types.generated.ts`);
