import { Router } from "express";
import { z } from "zod";
import {
  loginService,
  refreshTokenService,
  setupTwoFactorService,
  confirmTwoFactorService,
  forgotPasswordService,
  resetPasswordService,
} from "./auth.service";
import { loginRateLimiter } from "../../middleware/security";
import { requireAuth } from "../../middleware/auth";

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  twoFactorCode: z.string().optional(),
});

router.post("/login", loginRateLimiter, async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginService(input as any);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

const refreshSchema = z.object({ refreshToken: z.string().min(1) });

router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await refreshTokenService(refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/2fa/setup", requireAuth, async (req, res, next) => {
  try {
    const result = await setupTwoFactorService(req.user!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

const confirmSchema = z.object({ code: z.string().min(6).max(6) });

router.post("/2fa/confirm", requireAuth, async (req, res, next) => {
  try {
    const { code } = confirmSchema.parse(req.body);
    const result = await confirmTwoFactorService(req.user!.userId, code);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// --- Forgot / Reset password ---

const forgotSchema = z.object({
  username: z.string().min(1),
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const { username } = forgotSchema.parse(req.body);
    const result = await forgotPasswordService(username);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

const resetSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, newPassword } = resetSchema.parse(req.body);
    const result = await resetPasswordService(token, newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
