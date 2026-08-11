import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/security";

export async function createWasteEntryService(input: {
  warehouseId: string; branchId: string; productId: string;
  quantity: number; reason: string; userId?: string; notes?: string;
}) {
  if (input.quantity <= 0) throw new AppError("Quantity must be positive", 400);

  return prisma.$transaction(async (tx) => {
    // Get actual product cost
    const product = await tx.product.findUniqueOrThrow({
      where: { id: input.productId },
      select: { costPrice: true, name: true },
    });
    const unitCost = Number(product.costPrice);
    const totalCost = input.quantity * unitCost;

    // Create waste entry with REAL cost
    const waste = await tx.wasteEntry.create({
      data: {
        ...input,
        unitCost,
        totalCost,
      },
    });

    // Record stock movement
    await tx.stockMovement.create({
      data: {
        warehouseId: input.warehouseId,
        productId: input.productId,
        type: "WASTE",
        quantity: input.quantity,
        unitCost,
        reference: waste.id,
        notes: input.reason,
      },
    });

    // Deduct from stock
    const stockLevel = await tx.stockLevel.findFirst({
      where: { warehouseId: input.warehouseId, productId: input.productId, batchNumber: null },
    });
    if (!stockLevel || Number(stockLevel.quantity) < input.quantity) {
      throw new AppError("Insufficient stock", 400);
    }
    await tx.stockLevel.update({
      where: { id: stockLevel.id },
      data: { quantity: { decrement: input.quantity } },
    });

    return waste;
  });
}

export async function listWasteEntriesService(branchId: string, start?: Date, end?: Date) {
  const where: any = { branchId };
  if (start && end) where.createdAt = { gte: start, lte: end };
  return prisma.wasteEntry.findMany({
    where,
    include: { product: { select: { name: true, costPrice: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function wasteSummaryService(branchId: string, start: Date, end: Date) {
  const entries = await prisma.wasteEntry.findMany({
    where: { branchId, createdAt: { gte: start, lte: end } },
    include: { product: { select: { name: true, costPrice: true } } },
  });

  // Calculate REAL total cost from actual product costs
  const totalCost = entries.reduce((sum, e) => {
    const unitCost = e.unitCost ? Number(e.unitCost) : Number(e.product?.costPrice ?? 0);
    return sum + Number(e.quantity) * unitCost;
  }, 0);

  return {
    branchId, start, end,
    totalWasteCost: parseFloat(totalCost.toFixed(2)),
    entryCount: entries.length,
    entries: entries.map((e) => ({
      id: e.id,
      productName: e.product?.name ?? "Unknown",
      quantity: Number(e.quantity),
      unitCost: e.unitCost ? Number(e.unitCost) : Number(e.product?.costPrice ?? 0),
      totalCost: e.totalCost ? Number(e.totalCost) : Number(e.quantity) * Number(e.product?.costPrice ?? 0),
      reason: e.reason,
      createdAt: e.createdAt,
    })),
  };
}
