/* eslint-env node */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: parseInt(env.PORT),
      proxy: {
        "/api": {
          target: "http://localhost:5129",
            /*"https://mokametrics-api-fafshjgtf4degege.italynorth-01.azurewebsites.net",*/
          changeOrigin: true,
          // Don't rewrite the path - keep /api prefix
          secure: false,//<-- DA METTERE TRUE IN PRODUZIONE
        },
        "/productionHub": {
          target: env.VITE_APP_SIGNALR_HUB_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: "dist",
      rollupOptions: {
        input: "./index.html",
      },
    },
  };
});
