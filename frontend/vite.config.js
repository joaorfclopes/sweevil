import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
  // process.env takes precedence so Docker compose environment vars override .env file
  const env = { ...loadEnv(mode, '../', ''), ...process.env };
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
      host: '0.0.0.0',
      port: parseInt(env.FRONTEND_PORT) || 3000,
      hmr:
        env.CHOKIDAR_USEPOLLING === 'true'
          ? { host: 'localhost', port: parseInt(env.FRONTEND_PORT) || parseInt(env.PORT) || 3000 }
          : true,
      proxy: {
        '/api': {
          target: `http://${env.BACKEND_HOST || '127.0.0.1'}:${env.BACKEND_PORT || '8123'}`,
          changeOrigin: true,
        },
      },
      watch: {
        usePolling: env.CHOKIDAR_USEPOLLING === 'true',
        interval: 300,
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
    optimizeDeps: {
      include: ['react-phone-input-2'],
    },
    build: {
      outDir: 'build',
      sourcemap: true,
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      globals: true,
    },
  };
});
