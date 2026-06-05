import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    // Neon can cold-start; give DB-backed integration tests room.
    testTimeout: 30000,
    hookTimeout: 30000,
    // Integration tests share one database; run files serially so a global
    // operation in one file can't race another file's row lifecycle.
    fileParallelism: false,
  },
});
