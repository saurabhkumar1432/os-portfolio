/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Portfolio OS - Interactive Desktop Experience',
        short_name: 'Portfolio OS',
        description: 'An interactive, browser-based desktop operating system that serves as a portfolio website',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'landscape-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },

            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['@tanstack/react-router'],
          'vendor-animation': ['framer-motion'],
          'vendor-state': ['zustand'],
          'vendor-pdf': ['pdfjs-dist'],
          'vendor-search': ['fuse.js'],
          
          // App chunks
          'app-projects': ['./src/apps/ProjectsApp.tsx'],
          'app-file-explorer': ['./src/apps/FileExplorerApp.tsx'],
          'app-terminal': ['./src/apps/TerminalApp.tsx'],
          'app-about': ['./src/apps/AboutApp.tsx'],
          'app-notepad': ['./src/apps/NotepadApp.tsx'],
          'app-settings': ['./src/apps/SettingsApp.tsx'],
          'app-resume': ['./src/apps/ResumeViewerApp.tsx'],
          
          // Component chunks
          'components-ui': [
            './src/components/ui/AppLoadingSpinner.tsx',
            './src/components/AppLoader.tsx'
          ],
          'components-window': ['./src/components/window'],
          'components-desktop': ['./src/components/desktop'],
          
          // Service chunks
          'services-core': [
            './src/services/appRegistry.ts',
            './src/services/preloadService.ts',
            './src/services/appLauncher.ts'
          ]
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Ensure clean state between tests
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
