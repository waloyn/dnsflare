import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Element Plus components are resolved on demand (JS + per-component styles);
    // do not re-add a global `app.use(ElementPlus)` / full CSS import.
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`,
        manualChunks(id) {
          // Splitting element-plus into its own chunk re-includes the whole
          // library (the root re-export hub defeats tree-shaking when it gets
          // its own chunk), so only non-element-plus deps are split out here.
          if (!id.includes('node_modules')) return undefined
          if (/[\\/]node_modules[\\/](element-plus|@element-plus)[\\/]/.test(id)) return undefined
          return 'vendor'
        }
      }
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.cloudflare.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/client/v4')
      },
    },
  },
})
