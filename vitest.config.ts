import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'lib/money.ts',
        'lib/tax.ts',
        'lib/eligibility.ts',
        'lib/double-charge.ts',
        'lib/aliases.ts',
        'lib/alias-provenance.ts',
        'lib/data-schema.ts',
        'lib/merchants.ts',
        'scripts/build-merchants.ts',
      ],
      reporter: ['text', 'json-summary', 'html'],
    },
  },
});
