import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

async function resolveViteConfig() {
  if (typeof viteConfig === "function") {
    return await viteConfig({
      command: "serve",
      mode: process.env.NODE_ENV === "production" ? "production" : "development",
      isSsrBuild: false,
      isPreview: false,
    });
  }

  return viteConfig;
}

export async function setupVite(app: Express, server: Server) {
  const resolvedConfig = await resolveViteConfig();
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...resolvedConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.get("*", async (req, res, next) => {
    const url = req.originalUrl;
    const acceptsHtml = req.headers.accept?.includes("text/html");
    const pathname = req.path;
    const looksLikeAssetRequest =
      pathname.startsWith("/src/") ||
      pathname.startsWith("/@vite/") ||
      pathname.startsWith("/node_modules/") ||
      pathname.includes(".");

    if (!acceptsHtml || looksLikeAssetRequest) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
