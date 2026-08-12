// Always load JS version (HTTP proxy / CommonJS compatible)
const authModule = require("./auth.service.js");

const { Router } = require("express");
const { z } = require("zod");
const { loginRateLimiter } = require("../../middleware/security");
const { requireAuth } = require("../../middleware/auth");

const router = Router();

const loginSchema = z.object({ username: z.string().min(1), password: z.string().min(1), twoFactorCode: z.string().optional() });

router.post("/login", loginRateLimiter, async (req, res, next) => {
  try { const input = loginSchema.parse(req.body); const result = await authModule.loginService(input); res.json(result); } catch (err) { next(err); }
});

router.post("/refresh", async (req, res, next) => {
  try { const { refreshToken } = z.object({ refreshToken: z.string().min(1) }).parse(req.body); res.json(await authModule.refreshTokenService(refreshToken)); } catch (err) { next(err); }
});

router.post("/2fa/setup", requireAuth, async (req, res, next) => {
  try { res.json(await authModule.setupTwoFactorService(req.user.userId)); } catch (err) { next(err); }
});

router.post("/2fa/confirm", requireAuth, async (req, res, next) => {
  try { const { code } = z.object({ code: z.string().min(6).max(6) }).parse(req.body); res.json(await authModule.confirmTwoFactorService(req.user.userId, code)); } catch (err) { next(err); }
});

router.post("/forgot-password", async (req, res, next) => {
  try { const { username } = z.object({ username: z.string().min(1) }).parse(req.body); res.json(await authModule.forgotPasswordService(username)); } catch (err) { next(err); }
});

router.post("/reset-password", async (req, res, next) => {
  try { const { token, newPassword } = z.object({ token: z.string().min(1), newPassword: z.string().min(8) }).parse(req.body); res.json(await authModule.resetPasswordService(token, newPassword)); } catch (err) { next(err); }
});

module.exports = router;
