// FIX: Add a triple-slash directive to include Node.js types and resolve the error on 'process.cwd()'.
/// <reference types="node" />

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'script',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        },
        manifest: {
          "short_name": "Mi Negocio",
          "name": "Gestiona tu negocio gratis",
          "description": "Una aplicación web que replica las funcionalidades principales de la app Treinta para la gestión de pequeños negocios. Permite a los usuarios registrar ventas, gestionar inventario, anotar gastos y obtener análisis de rendimiento de su negocio impulsados por IA.",
          "icons": [
            {
              "src": "/icons/icon-192x192.svg",
              "type": "image/svg+xml",
              "sizes": "192x192",
              "purpose": "any maskable"
            },
            {
              "src": "/icons/icon-512x512.svg",
              "type": "image/svg+xml",
              "sizes": "512x512",
              "purpose": "any maskable"
            }
          ],
          "start_url": ".",
          "display": "standalone",
          "theme_color": "#22c55e",
          "background_color": "#f1f5f9"
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
      'process.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
      'process.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
      'process.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
      'process.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
      'process.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID)
    }
  }
})