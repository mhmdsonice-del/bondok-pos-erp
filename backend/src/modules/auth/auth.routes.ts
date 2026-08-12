import { Router } from "express";
import { z } from "zod";
import { loginRateLimiter } from "../../middleware/security";
import { requireAuth } from "../../middleware/auth";

// Dynamically pick the right module — JS version on Vercel, TS version locally
const vercel = !!(process.env.VERCEL || process.env.DB_PROXY_URL);
const authModule = vercel
  ? require("./auth.service.js")
  : require("./auth.service").default || require("./auth.service");

const router = Router();

const loginSchema = z.object({ username: z.string().min(1), password: z.string().min(1), twoFactorCode: z.string().optional() });

router.post("/login", loginRateLimiter, async (req, res, next) => {
  try { const input = loginSchema.parse(req.body); const result = await authModule.loginService(input as any); res.json(result); } catch (err) { next(err); }
});

const refreshSchema = z.object({ refreshToken: z.string().min(1) });
router.post("/refresh", async (req, res, next) => {
  try { const { refreshToken: token } = refreshSchema.parse(req.body); const result = await authModule.refreshTokenService(token); res.json(result); } catch (err) { next(err); }
});

router.post("/2fa/setup", requireAuth, async (req, res, next) => {
  try { res.json(await authModule.setupTwoFactorService(req.user!.userId)); } catch (err) { next(err); }
});

const confirmSchema = z.object({ code: z.string().min(6).max(6) });
router.post("/2fa/confirm", requireAuth, async (req, res, next) => {
  try { res.json(await authModule.confirmTwoFactorService(req.user!.userId, req.body.code)); } catch (err) { next(err); }
});

const forgotSchema = z.object({ username: z.string().min(1) });
router.post("/forgot-password", async (req, res, next) => {
  try { res.json(await authModule.forgotPasswordService(req.body.username)); } catch (err) { next(err); }
});

const resetSchema = z.object({ token: z.string().min(1), newPassword: z.string().min(8) });
router.post("/reset-password", async (req, res, next) => {
  try { const { token, newPassword } = resetSchema.parse(req.body); res.json(await authModule.resetPasswordService(token, newPassword)); } catch (err) { next(err); }
});

export default router;
