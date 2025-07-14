import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/general-ledger-system/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types'),
      '@/services': resolve(__dirname, './src/services'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/constants': resolve(__dirname, './src/constants')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disabled for production to reduce bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd', '@ant-design/charts', '@ant-design/icons'],
          'utils-vendor': ['lodash', 'dayjs', 'decimal.js', 'fast-xml-parser', 'zod']
        }
      }
    },
    // Optimize for GitHub Pages
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild'
  },
  server: {
    port: 3000,
    open: true,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      '@ant-design/charts',
      'lucide-react',
      'dayjs',
      'decimal.js',
      'fast-xml-parser',
      'zod',
      'lodash'
    ]
  }
})