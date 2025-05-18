import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const resolveConfig = {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
};

export default defineConfig({
  server: {
    proxy: {
      "/api": process.env.VITE_API_BASE_URL || "http://localhost:5000",
    },
  },
  plugins: [react()],
  resolve: resolveConfig,
});
