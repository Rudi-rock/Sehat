import { resolve } from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Sehat — Digital Health Identity',
        short_name: 'Sehat',
        description: 'Offline-First Health Identity for Rural India',
        theme_color: '#070d0a',
        background_color: '#070d0a',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        register: resolve(__dirname, 'register.html'),
        scan: resolve(__dirname, 'scan.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        notFound: resolve(__dirname, '404.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
