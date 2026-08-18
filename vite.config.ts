import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";


export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
 
    mode === "development" && componentTagger()
  ].filter(Boolean),

  server: {
    host: "localhost",
    port: 5001,
    // Same-origin API in dev — cookies (refresh token) just work.
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
