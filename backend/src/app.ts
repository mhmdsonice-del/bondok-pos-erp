import express from "express";
import cors from "cors";
import compression from "compression";
import { env } from "./config/env";
import { helmetMiddleware, apiRateLimiter, errorHandler } from "./middleware/security";
import routes from "./routes";

export function createApp() {
  const app = express();

  app.use(helmetMiddleware);
  app.use(cors({ origin: env.CORS_ORIGIN.split(","), credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(apiRateLimiter);

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/v1", routes);

  // 404 handler
  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  // Must be registered last
  app.use(errorHandler);

  return app;
}
