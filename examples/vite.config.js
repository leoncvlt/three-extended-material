const { resolve } = require("path");
import { defineConfig } from "vite";

export default defineConfig({
  base: "/three-extended-material/",
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
