import { defineConfig, loadEnv } from "vite";
import { localProfilePreview } from "./scripts/preview-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "NOMO_");
  const preview = command === "serve" && env.NOMO_PREVIEW_DIR;
  return {
  define: { __NOMO_PREVIEW__: preview ? JSON.stringify({ username: "preview", base: "/__nomo-local" }) : "undefined" },
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

          if (id.includes("three")) {
            return "three";
          }

          if (id.includes("react")) {
            return "react";
          }
        },
      },
    },
  },
  plugins: [react(), ...(preview ? [localProfilePreview(env.NOMO_PREVIEW_DIR)] : [])],
  };
});
