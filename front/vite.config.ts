import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // forward /data/* to Flask on :5000
      "^/data/.*": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      // (optional) your API:
      "^/api/.*": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
