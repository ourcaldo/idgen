import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy: {
      '/api/namefake': {
        target: 'https://api.namefake.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/namefake/, ''),
      },
      '/api/unsplash': {
        target: 'https://api.unsplash.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/unsplash/, ''),
      },
      '/api/card': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
