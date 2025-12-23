import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward /data/* to backend (which serves static assets)
      "^/data/.*": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
      },
      // Forward API calls to backend
      "^/api/.*": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
