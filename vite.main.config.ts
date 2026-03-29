import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    conditions: ['node'],
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      external: ['better-sqlite3'],
    },
  },
});
