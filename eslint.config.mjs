import nextVitals from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['.next', 'next-env.d.ts', 'node_modules', 'cli/node_modules']),
  ...nextVitals,
  ...tseslint.configs.recommended,
  { files: ['src/**/*.{ts,tsx}'], rules: { complexity: ['error', 10] } },
]);
