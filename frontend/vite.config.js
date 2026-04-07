import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../', '')
  return {
    plugins: [
      react(),
      svgr(),
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
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    build: {
      outDir: 'build',
    },
  }
})
