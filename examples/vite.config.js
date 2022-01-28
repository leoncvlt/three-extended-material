const { resolve } = require("path");
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    open: true,
  },
  build: {
    outDir: "./dist",
    emptyOutDir: true,
    brotliSize: 1024,
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      input: {
        simple: resolve(__dirname, "simple/index.html"),
        complex: resolve(__dirname, "complex/index.html"),
      },
      output: {
        manualChunks: { three: ["three"] },
      },
    },
  },
});
