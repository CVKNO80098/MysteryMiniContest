import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      // 用 @ 代表 src 目录，import 的时候就不用写一长串 ../../
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    // 前端开发服务器端口，启动后访问 http://localhost:5173
    port: 5173,
    proxy: {
      // 把 /api 开头的请求转发给 SpringBoot（8080 端口），这样开发时不用管跨域
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
