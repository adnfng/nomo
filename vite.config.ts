import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("react-markdown") || id.includes("remark-") || id.includes("unified")) {
            return "markdown";
          }

          if (id.includes("react-router")) {
            return "router";
          }

          if (id.includes("react")) {
            return "react";
          }
        },
      },
    },
  },
  plugins: [react()],
});
