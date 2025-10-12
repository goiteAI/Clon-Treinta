// The reference to "node" types was removed as it caused a "Cannot find type definition" error, likely because @types/node is not installed.
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cast `process` to `any` to bypass the TypeScript error for `cwd`, which is available in the Node.js environment where Vite configs run.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
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
    build: {
      rollupOptions: {
        external: ['@google/genai']
      }
    }
  }
})