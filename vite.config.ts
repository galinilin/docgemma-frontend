import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:8000/api'

  // Dev proxy: only useful when API URL is absolute (local dev).
  // Production builds set VITE_API_URL=/api (relative) — no proxy needed.
  let proxy = {}
  try {
    const apiOrigin = new URL(apiUrl).origin
    const wsOrigin = apiOrigin.replace(/^http/, 'ws')
    proxy = {
      '/api': {
        target: apiOrigin,
        changeOrigin: true,
      },
      '/api/sessions': {
        target: wsOrigin,
        ws: true,
      },
    }
  } catch {
    // Relative URL (e.g. /api) — skip proxy config
  }

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3000,
      proxy,
    },
  }
})
