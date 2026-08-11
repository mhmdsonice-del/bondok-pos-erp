import { authenticator } from "otplib";
import { prisma } from "../../config/prisma";
import { verifyPassword, hashPassword } from "../../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken, signResetToken, verifyResetToken } from "../../utils/jwt";
import { AppError } from "../../middleware/security";

interface LoginInput {
  username: string;
  password: string;
  twoFactorCode?: string;
}

export async function loginService({ username, password, twoFactorCode }: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      branches: {
        include: {
          branch: {
            include: { warehouses: { where: { isActive: true }, take: 1 } },
          },
        },
      },
    },
  });

  if (!user || !user.isActive) {
    throw new AppError("Invalid credentials", 401);
  }

  const validPassword = await verifyPassword(user.passwordHash, password);
  if (!validPassword) {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN_FAILED",
        entityType: "User",
        entityId: user.id,
      },
    }).catch(() => {});
    throw new AppError("Invalid credentials", 401);
  }

  if (user.twoFactorEnabled) {
    if (!twoFactorCode) {
      return { requiresTwoFactor: true };
    }
    const isValidCode = authenticator.check(twoFactorCode, user.twoFactorSecret ?? "");
    if (!isValidCode) {
      throw new AppError("Invalid two-factor code", 401);
    }
  }

  const branchIds = user.branches.map((b) => b.branchId);

  const accessToken = signAccessToken({
    userId: user.id,
    companyId: user.companyId,
    role: user.role,
    branchIds,
  });

  const refreshToken = signRefreshToken({ userId: user.id, tokenVersion: 0 });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "LOGIN_SUCCESS",
      entityType: "User",
      entityId: user.id,
    },
  });

  const availableBranches = user.branches.map((ub) => ({
    id: ub.branch.id,
    name: ub.branch.name,
    warehouseId: ub.branch.warehouses[0]?.id ?? null,
  }));

  return {
    requiresTwoFactor: false,
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      companyId: user.companyId,
      branchIds,
    },
    branches: availableBranches,
  };
}

export async function refreshTokenService(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      branches: {
        include: {
          branch: {
            include: { warehouses: { where: { isActive: true }, take: 1 } },
          },
        },
      },
    },
  });

  if (!user || !user.isActive) {
    throw new AppError("User not found or inactive", 401);
  }

  const accessToken = signAccessToken({
    userId: user.id,
    companyId: user.companyId,
    role: user.role,
    branchIds: user.branches.map((b) => b.branchId),
  });

  const availableBranches = user.branches.map((ub) => ({
    id: ub.branch.id,
    name: ub.branch.name,
    warehouseId: ub.branch.warehouses[0]?.id ?? null,
  }));

  return { accessToken, branches: availableBranches };
}

export async function setupTwoFactorService(userId: string) {
  const secret = authenticator.generateSecret();
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret, twoFactorEnabled: false },
  });
  return { secret };
}

export async function confirmTwoFactorService(userId: string, code: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const isValid = authenticator.check(code, user.twoFactorSecret ?? "");
  if (!isValid) {
    throw new AppError("Invalid two-factor code", 400);
  }
  await prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });
  return { enabled: true };
}

// =============================================
// Forgot / Reset Password
// =============================================

export async function forgotPasswordService(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });

  const response = {
    message: "If the account exists, a reset link has been generated.",
  };

  if (!user || !user.isActive) {
    return response;
  }

  const resetToken = signResetToken({ userId: user.id });

  return { ...response, resetToken };
}

export async function resetPasswordService(token: string, newPassword: string) {
  let payload;
  try {
    payload = verifyResetToken(token);
  } catch {
    throw new AppError("Invalid or expired reset token. Please request a new one.", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) {
    throw new AppError("User not found or inactive", 404);
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  await prisma.auditLog.create({
    data: { userId: user.id, action: "PASSWORD_RESET", entityType: "User", entityId: user.id },
  }).catch(() => {});

  return { message: "Password has been reset successfully." };
}
