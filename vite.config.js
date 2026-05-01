import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Legacy plugin handles JS targets; keep CSS readable for older WebViews.
  build: {
    cssTarget: 'chrome61',
  },
  plugins: [
    react(),
    legacy({
      targets: ['Chrome >= 61', 'Android >= 7', 'iOS >= 12', 'defaults'],
      renderModernChunks: false,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-512.png'],
      manifest: {
        name: 'BeaconLift Workout Tracker',
        short_name: 'BeaconLift',
        description: 'Premium Workout Tracker for Strength Athletes',
        theme_color: '#141414',
        background_color: '#141414',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-512.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,js.map}']
      }
    })
  ],
  resolve: {
    alias: {
      'react-is': 'react-is'
    }
  },
  optimizeDeps: {
    include: ['react-is', 'recharts']
  }
})
