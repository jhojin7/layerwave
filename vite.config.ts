import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'prompt',
    injectRegister: false,
    manifest: {
      id: '/', name: 'Layerwave', short_name: 'Layerwave',
      description: 'Layer YouTube music and ambient sounds.',
      start_url: '/', scope: '/', display: 'standalone',
      theme_color: '#0a0a0a', background_color: '#0a0a0a',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      navigateFallbackAllowlist: [/^\/$/],
      // No runtime media caching: YouTube remains online-only.
    },
  })],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
