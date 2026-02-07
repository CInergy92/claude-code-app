import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: {
          index: 'src/main/index.ts'
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: {
          preload: 'src/main/preload.ts'
        }
      }
    }
  },
  renderer: {
    plugins: [react()],
    root: 'src/renderer',
    publicDir: 'public',
    build: {
      outDir: '../../out/renderer',
      rollupOptions: {
        input: {
          index: 'src/renderer/index.html'
        }
      }
    },
    optimizeDeps: {
      include: ['vosk-browser']
    }
  }
})
