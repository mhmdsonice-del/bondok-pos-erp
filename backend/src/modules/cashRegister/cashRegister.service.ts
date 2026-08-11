import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/security";

export async function openCashRegisterService(branchId: string, userId: string, openingAmount: number) {
  const existing = await prisma.cashRegister.findFirst({ where: { branchId, isClosed: false } });
  if (existing) throw new AppError("A cash register is already open for this branch", 409);
  return prisma.$transaction(async (tx) => {
    const register = await tx.cashRegister.create({
      data: { branchId, openingAmount, openedById: userId },
    });
    await tx.cashMovement.create({
      data: { cashRegisterId: register.id, userId, type: "OPENING", amount: openingAmount },
    });
    return register;
  });
}

export async function getCurrentRegisterService(branchId: string) {
  return prisma.cashRegister.findFirst({
    where: { branchId, isClosed: false },
    include: { movements: { orderBy: { createdAt: "desc" }, take: 100 } },
  });
}

export async function getRegisterByIdService(registerId: string) {
  return prisma.cashRegister.findUnique({
    where: { id: registerId },
    include: { movements: { orderBy: { createdAt: "desc" } } },
  });
}

export async function recordCashMovementService(input: {
  cashRegisterId: string; type: string; amount: number; notes?: string; userId: string; orderId?: string;
}) {
  return prisma.cashMovement.create({ data: input as any });
}

export async function closeCashRegisterService(
  cashRegisterId: string, userId: string, actualClosingAmount: number, closingReason?: string
) {
  return prisma.$transaction(async (tx) => {
    const register = await tx.cashRegister.findUniqueOrThrow({
      where: { id: cashRegisterId }, include: { movements: true },
    });
    if (register.isClosed) throw new AppError("Cash register is already closed", 400);

    const receipts = register.movements
      .filter((m) => m.type === "RECEIPT" || m.type === "SALE_RECEIPT")
      .reduce((s, m) => s + Number(m.amount), 0);
    const payments = register.movements
      .filter((m) => m.type === "PAYMENT" || m.type === "REFUND_PAYOUT")
      .reduce((s, m) => s + Number(m.amount), 0);
    const expectedClosing = Number(register.openingAmount) + receipts - payments;
    const variance = actualClosingAmount - expectedClosing;

    await tx.cashMovement.create({
      data: {
        cashRegisterId, userId, type: "CLOSING",
        amount: actualClosingAmount, notes: closingReason,
      },
    });
    await tx.cashRegister.update({
      where: { id: cashRegisterId },
      data: { closedAt: new Date(), closingAmount: actualClosingAmount, isClosed: true },
    });
    await tx.auditLog.create({
      data: {
        userId, action: "CASH_REGISTER_CLOSED", entityType: "CashRegister",
        entityId: cashRegisterId,
        metadata: { expectedClosing, actualClosingAmount, variance },
      },
    });
    return { cashRegisterId, expectedClosing, actualClosingAmount, variance };
  });
}

export async function monthlyClosingReportService(branchId: string, year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const registers = await prisma.cashRegister.findMany({
    where: { branchId, openedAt: { gte: start, lte: end } },
    include: { movements: true },
  });
  const totalOpening = registers.reduce((s, r) => s + Number(r.openingAmount), 0);
  const totalReceipts = registers.reduce(
    (s, r) => s + r.movements.filter((m) => m.type === "RECEIPT" || m.type === "SALE_RECEIPT")
      .reduce((a, m) => a + Number(m.amount), 0), 0
  );
  const totalPayments = registers.reduce(
    (s, r) => s + r.movements.filter((m) => m.type === "PAYMENT" || m.type === "REFUND_PAYOUT")
      .reduce((a, m) => a + Number(m.amount), 0), 0
  );
  const totalSalesReceipts = registers.reduce(
    (s, r) => s + r.movements.filter((m) => m.type === "SALE_RECEIPT")
      .reduce((a, m) => a + Number(m.amount), 0), 0
  );
  const totalRefunds = registers.reduce(
    (s, r) => s + r.movements.filter((m) => m.type === "REFUND_PAYOUT")
      .reduce((a, m) => a + Number(m.amount), 0), 0
  );
  return {
    branchId, year, month, totalOpening, totalReceipts, totalPayments,
    totalSalesReceipts, totalRefunds,
    netCash: totalOpening + totalReceipts - totalPayments,
    registerCount: registers.length,
  };
}

/** Get cash movements for a specific order */
export async function getOrderCashMovementsService(orderId: string) {
  return prisma.cashMovement.findMany({
    where: { orderId },
    include: { cashRegister: { select: { branchId: true, openedAt: true, closedAt: true } } },
    orderBy: { createdAt: "desc" },
  });
}
