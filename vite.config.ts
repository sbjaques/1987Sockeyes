/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { filterMediaPlugin } from './vite-plugin-filter-media';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const buildMode = env.VITE_BUILD_MODE ?? 'public';
  if (buildMode !== 'public' && buildMode !== 'private') {
    throw new Error(`VITE_BUILD_MODE must be 'public' or 'private', got '${buildMode}'`);
  }
  return {
    plugins: [react(), filterMediaPlugin(buildMode as 'public' | 'private')],
    base: '/',
    build: {
      outDir: buildMode === 'private' ? 'dist-private' : 'dist-public',
      sourcemap: false,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test-setup.ts'],
    },
  };
});
