import {defineConfig} from 'vite'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@sanity/telemetry': path.resolve(__dirname, '../../src'),
    },
  },
})
