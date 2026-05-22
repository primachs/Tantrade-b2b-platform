import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const rootDir = process.cwd();

export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(rootDir),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});