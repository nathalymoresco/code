import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@travelmatch/shared': path.resolve(__dirname, './src'),
    },
  },
});
