import { prisma } from "../../config/prisma";
import { hashPassword } from "../../utils/password";
import { AppError } from "../../middleware/security";
import type { UserRole, AttendanceStatus } from "@prisma/client";

export async function createEmployeeService(input: { companyId: string; fullName: string; username: string; email?: string; phone?: string; password: string; role: UserRole; branchIds: string[] }) {
  if (input.branchIds.length > 0) {
    const branches = await prisma.branch.findMany({ where: { id: { in: input.branchIds }, companyId: input.companyId } });
    if (branches.length !== input.branchIds.length) throw new AppError("One or more branches not found in this company", 400);
  }
  const existing = await prisma.user.findFirst({ where: { username: input.username, companyId: input.companyId } });
  if (existing) throw new AppError("Username already taken", 409);
  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({ data: { companyId: input.companyId, fullName: input.fullName, username: input.username, email: input.email, phone: input.phone, passwordHash, role: input.role, branches: { create: input.branchIds.map((branchId) => ({ branchId })) } }, select: { id: true, fullName: true, username: true, role: true, createdAt: true } });
}

export async function listEmployeesService(companyId: string) {
  return prisma.user.findMany({ where: { companyId, isActive: true }, select: { id: true, fullName: true, username: true, role: true, createdAt: true }, orderBy: { fullName: "asc" } });
}

export async function updateEmployeeRoleService(userId: string, companyId: string, role: UserRole) {
  const user = await prisma.user.findFirst({ where: { id: userId, companyId } });
  if (!user) throw new AppError("Employee not found", 404);
  return prisma.user.update({ where: { id: userId }, data: { role } });
}

export async function deactivateEmployeeService(userId: string, companyId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId, companyId } });
  if (!user) throw new AppError("Employee not found", 404);
  return prisma.user.update({ where: { id: userId }, data: { isActive: false } });
}

export async function clockInOutService(userId: string, branchId: string, status: AttendanceStatus) {
  return prisma.attendance.create({ data: { userId, branchId, status } });
}

export async function attendanceReportService(userId: string, start: Date, end: Date) {
  return prisma.attendance.findMany({ where: { userId, timestamp: { gte: start, lte: end } }, orderBy: { timestamp: "asc" } });
}

export async function submitPerformanceReviewService(companyId: string, input: { userId: string; periodStart: Date; periodEnd: Date; score: number; notes?: string }) {
  if (input.score < 0 || input.score > 100) throw new AppError("Score must be between 0 and 100", 400);
  const user = await prisma.user.findFirst({ where: { id: input.userId, companyId } });
  if (!user) throw new AppError("Employee not found", 404);
  return prisma.performanceReview.create({ data: input });
}

export async function topSellingEmployeesService(branchId: string, start: Date, end: Date) {
  const results = await prisma.order.groupBy({ by: ["createdById"], where: { branchId, status: "COMPLETED", createdAt: { gte: start, lte: end } }, _sum: { totalAmount: true }, _count: { id: true }, orderBy: { _sum: { totalAmount: "desc" } }, take: 10 });
  const userIds = results.map((r) => r.createdById);
  const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, fullName: true } });
  const userMap = new Map(users.map((u) => [u.id, u.fullName]));
  return results.map((r) => ({ userId: r.createdById, fullName: userMap.get(r.createdById), totalSales: r._sum.totalAmount, orderCount: r._count.id }));
}