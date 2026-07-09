import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/workouts/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['lifttrack.svg', 'icons/*.png', 'exercises/*.webp'],
      manifest: {
        name: 'LiftTrack',
        short_name: 'LiftTrack',
        description: 'A private, local workout log.',
        theme_color: '#080d14',
        background_color: '#080d14',
        display: 'standalone',
        start_url: '/workouts/',
        scope: '/workouts/',
        icons: [
          { src: 'icons/lifttrack-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/lifttrack-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/lifttrack-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'] },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
  },
});
