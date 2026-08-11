import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/security";
import type { PaymentMethod } from "@prisma/client";

export async function createExpenseService(input: { branchId: string; categoryId?: string; amount: number; paymentMethod?: PaymentMethod; description?: string; attachmentUrl?: string }) {
  if (input.amount <= 0) throw new AppError("Amount must be positive", 400);
  return prisma.expense.create({ data: input });
}

export async function listExpensesService(branchId: string, start?: Date, end?: Date) {
  return prisma.expense.findMany({ where: { branchId, ...(start && end ? { createdAt: { gte: start, lte: end } } : {}) }, orderBy: { createdAt: "desc" } });
}

export async function createExpenseCategoryService(input: { companyId: string; name: string }) {
  return prisma.expenseCategory.create({ data: input });
}

export async function listExpenseCategoriesService(companyId: string) {
  return prisma.expenseCategory.findMany({ where: { companyId, isActive: true }, orderBy: { name: "asc" } });
}

export async function expensesSummaryService(branchId: string, start: Date, end: Date) {
  const expenses = await prisma.expense.findMany({ where: { branchId, createdAt: { gte: start, lte: end } } });
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  return { totalExpenses: total, expenseCount: expenses.length, expenses };
}