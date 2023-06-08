import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "node:path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@sanity/telemetry": path.resolve(__dirname, "./src"),
      "@sanity/telemetry/react": path.resolve(__dirname, "./src/react"),
    },
  },
})
