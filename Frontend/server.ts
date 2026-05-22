import type { Request, Response } from "express";
import path from "path";
import react from "@vitejs/plugin-react";
import { createProxyMiddleware } from "http-proxy-middleware";
import { createServer as createViteServer } from "vite";

const resolveBackendUrl = () => {
  const raw = (process.env.BACKEND_URL || process.env.VITE_BACKEND_URL || "http://localhost:8000").trim();
  return raw.replace(/\/$/, "");
};

async function startServer() {
  const expressModule = await import("express");
  const express = (expressModule as any).default ?? expressModule;
  const app = express();
  const backendUrl = resolveBackendUrl();

  app.use(
    "/api",
    createProxyMiddleware({
      target: backendUrl,
      changeOrigin: true,
      xfwd: true
    })
  );

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      configFile: false,
      plugins: [react()],
      resolve: {
        alias: {
          "@": process.cwd()
        }
      },
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
        watch: process.env.DISABLE_HMR === "true" ? null : {}
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, "0.0.0.0", () => {
    console.log(`[Frontend] Ready on http://0.0.0.0:${port} (proxying /api -> ${backendUrl})`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start frontend server", error);
});
