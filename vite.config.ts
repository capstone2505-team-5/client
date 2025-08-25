/// <reference types="vitest" /> i

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./setupTests.ts"],
  },
  build: {
    rollupOptions: {
      output: {
        // Ensure config.js is not bundled
        manualChunks: {
          config: ['config.js']
        }
      }
    }
  }
});
