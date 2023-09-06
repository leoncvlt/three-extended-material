const { resolve } = require("path");
import { defineConfig } from "vite";
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
        react: resolve(__dirname, "react/index.html"),
      },
      output: {
        manualChunks: { three: ["three"] },
      },
    },
  },
});
