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
          target: 
            "https://mokametrics-api-fafshjgtf4degege.italynorth-01.azurewebsites.net", /*"http://localhost:5129"*/
          changeOrigin: true,
          secure: false,//<-- DA METTERE TRUE IN PRODUZIONE
        },
        "/productionHub": {
          target: "https://mokametrics-api-fafshjgtf4degege.italynorth-01.azurewebsites.net",
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
