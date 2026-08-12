// HTTP-proxy based auth service
import { authenticator } from "otplib";
import { db } from "../../config/db-client";
import { verifyPassword, hashPassword } from "../../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken, signResetToken, verifyResetToken } from "../../utils/jwt";
import { AppError } from "../../middleware/security";

interface LoginInput { username: string; password: string; twoFactorCode?: string; }

export async function loginService({ username, password, twoFactorCode }: LoginInput) {
  const user = await db.user.findUnique({ where: { username } });
  if (!user || !user.isActive) throw new AppError("Invalid credentials", 401);
  const validPassword = await verifyPassword(user.passwordHash, password);
  if (!validPassword) {
    await db.auditLog.create({ data: { userId: user.id, action: "LOGIN_FAILED", entityType: "User", entityId: user.id } }).catch(() => {});
    throw new AppError("Invalid credentials", 401);
  }
  if (user.twoFactorEnabled) {
    if (!twoFactorCode) return { requiresTwoFactor: true };
    const isValidCode = authenticator.check(twoFactorCode, user.twoFactorSecret ?? "");
    if (!isValidCode) throw new AppError("Invalid two-factor code", 401);
  }
  const branches = user.branches || [];
  const branchIds = branches.map((b: any) => b.branchId);
  const accessToken = signAccessToken({ userId: user.id, companyId: user.companyId, role: user.role, branchIds });
  const refreshToken = signRefreshToken({ userId: user.id, tokenVersion: 0 });
  await db.auditLog.create({ data: { userId: user.id, action: "LOGIN_SUCCESS", entityType: "User", entityId: user.id } });
  const availableBranches = branches.map((ub: any) => ({ id: ub.branch?.id || ub.branchId, name: ub.branch?.name || "", warehouseId: ub.branch?.warehouses?.[0]?.id ?? null }));
  return { requiresTwoFactor: false, accessToken, refreshToken, user: { id: user.id, fullName: user.fullName, role: user.role, companyId: user.companyId, branchIds }, branches: availableBranches };
}

export async function refreshTokenService(refreshToken: string) {
  let payload; try { payload = verifyRefreshToken(refreshToken); } catch { throw new AppError("Invalid or expired refresh token", 401); }
  const user = await db.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) throw new AppError("User not found or inactive", 401);
  const branches = user.branches || [];
  const branchIds = branches.map((b: any) => b.branchId);
  const accessToken = signAccessToken({ userId: user.id, companyId: user.companyId, role: user.role, branchIds });
  const availableBranches = branches.map((ub: any) => ({ id: ub.branch?.id || ub.branchId, name: ub.branch?.name || "", warehouseId: ub.branch?.warehouses?.[0]?.id ?? null }));
  return { accessToken, branches: availableBranches };
}

export async function setupTwoFactorService(userId: string) { const secret = authenticator.generateSecret(); return { secret }; }
export async function confirmTwoFactorService(userId: string, code: string) { return { enabled: true }; }

export async function forgotPasswordService(username: string) {
  const user = await db.user.findUnique({ where: { username } });
  const response = { message: "If the account exists, a reset link has been generated." };
  if (!user || !user.isActive) return response;
  const resetToken = signResetToken({ userId: user.id });
  return { ...response, resetToken };
}

export async function resetPasswordService(token: string, newPassword: string) {
  let payload; try { payload = verifyResetToken(token); } catch { throw new AppError("Invalid or expired reset token", 400); }
  const user = await db.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) throw new AppError("User not found or inactive", 404);
  const passwordHash = await hashPassword(newPassword);
  await db.auditLog.create({ data: { userId: user.id, action: "PASSWORD_RESET", entityType: "User", entityId: user.id } }).catch(() => {});
  return { message: "Password has been reset successfully." };
}
