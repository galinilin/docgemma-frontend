import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:8000/api'
  // Extract origin (e.g. "http://localhost:8081") from the API URL
  const apiOrigin = new URL(apiUrl).origin
  const wsOrigin = apiOrigin.replace(/^http/, 'ws')

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: apiOrigin,
          changeOrigin: true,
        },
        '/api/sessions': {
          target: wsOrigin,
          ws: true,
        },
      },
    },
  }
})
