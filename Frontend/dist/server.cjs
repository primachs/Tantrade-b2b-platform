var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_path = __toESM(require("path"), 1);
var import_plugin_react = __toESM(require("@vitejs/plugin-react"), 1);
var import_http_proxy_middleware = require("http-proxy-middleware");
var import_vite = require("vite");
var resolveBackendUrl = () => {
  const raw = (process.env.BACKEND_URL || process.env.VITE_BACKEND_URL || "http://localhost:8000").trim();
  return raw.replace(/\/$/, "");
};
async function startServer() {
  const expressModule = await import("express");
  const express = expressModule.default ?? expressModule;
  const app = express();
  const backendUrl = resolveBackendUrl();
  app.use(
    "/api",
    (0, import_http_proxy_middleware.createProxyMiddleware)({
      target: backendUrl,
      changeOrigin: true,
      xfwd: true
    })
  );
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      configFile: false,
      plugins: [(0, import_plugin_react.default)()],
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
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  const port = Number(process.env.PORT ?? 3e3);
  app.listen(port, "0.0.0.0", () => {
    console.log(`[Frontend] Ready on http://0.0.0.0:${port} (proxying /api -> ${backendUrl})`);
  });
}
startServer().catch((error) => {
  console.error("Failed to start frontend server", error);
});
//# sourceMappingURL=server.cjs.map
