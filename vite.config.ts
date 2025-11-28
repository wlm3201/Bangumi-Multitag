import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

let gh = process.env.DEPLOY

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      workbox: {
        globPatterns: ['**/*'],
        maximumFileSizeToCacheInBytes: 1024 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
  },
  base: gh ? 'Bangumi-Multitag' : '',
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (chunkInfo) =>
          chunkInfo.name?.endsWith('.wasm')
            ? 'assets/[name][extname]'
            : 'assets/[name]-[hash][extname]',
      },
    },
  },
})
