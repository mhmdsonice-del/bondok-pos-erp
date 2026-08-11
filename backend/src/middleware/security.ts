import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export const helmetMiddleware = helmet({ crossOriginResourcePolicy: { policy: "cross-origin" }, contentSecurityPolicy: false });

export const apiRateLimiter = rateLimit({ windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.RATE_LIMIT_MAX, standardHeaders: true, legacyHeaders: false, message: { error: "Too many requests, please try again later." } });

export const loginRateLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { error: "Too many login attempts, please try again later." } });

export class AppError extends Error { statusCode: number; code: string; constructor(message: string, statusCode = 400, code?: string) { super(message); this.statusCode = statusCode; this.code = code ?? "APP_ERROR"; } }

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
  if (typeof err === "object" && err !== null && "code" in err) { console.error("Prisma error:", (err as any).code); return res.status(500).json({ success: false, error: { code: "DATABASE_ERROR", message: "An internal error occurred" } }); }
  if (typeof err === "object" && err !== null && "name" in err && (err as any).name === "ZodError") return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input" } });
  console.error("Unhandled error:", err);
  return res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: env.NODE_ENV === "production" ? "Internal server error" : String(err) } });
}