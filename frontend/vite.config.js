import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../', '');
  return {
    plugins: [
      react(),
      svgr(),
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        silent: true,
      }),
    ],
    server: {
      port: parseInt(env.FRONTEND_PORT) || 3000,
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${env.BACKEND_PORT || '8123'}`,
          changeOrigin: true,
        },
      },
    },
    envDir: '../',
    envPrefix: 'VITE_',
    resolve: {
      mainFields: ['module', 'browser', 'main'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    build: {
      outDir: 'build',
      sourcemap: true,
    },
  };
});
