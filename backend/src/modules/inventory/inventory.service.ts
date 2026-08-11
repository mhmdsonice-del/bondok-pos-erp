import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/security";

/** Verify warehouse belongs to a branch that belongs to a company */
async function validateWarehouseAccess(warehouseId: string, companyId: string) {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: warehouseId },
    include: { branch: { select: { companyId: true, id: true } } },
  });
  if (!warehouse) throw new AppError("Warehouse not found", 404);
  if (warehouse.branch.companyId !== companyId) {
    throw new AppError("Warehouse does not belong to your company", 403);
  }
  return warehouse;
}

export async function adjustStockService(
  warehouseId: string, productId: string, delta: number,
  companyId: string, batchNumber?: string | null
) {
  await validateWarehouseAccess(warehouseId, companyId);
  const existing = await prisma.stockLevel.findFirst({
    where: { warehouseId, productId, batchNumber: batchNumber ?? null },
  });
  if (existing) {
    return prisma.stockLevel.update({
      where: { id: existing.id },
      data: { quantity: { increment: delta } },
    });
  }
  return prisma.stockLevel.create({
    data: { warehouseId, productId, quantity: delta, batchNumber: batchNumber ?? null },
  });
}

export async function getStockLevelService(warehouseId: string, companyId: string, productId?: string) {
  await validateWarehouseAccess(warehouseId, companyId);
  return prisma.stockLevel.findMany({
    where: { warehouseId, ...(productId ? { productId } : {}) },
    include: { product: { select: { name: true, sku: true, barcode: true } } },
    orderBy: { product: { name: "asc" } },
  });
}

export async function recordStockMovementService(
  input: {
    warehouseId: string; productId: string; type: string; quantity: number;
    batchNumber?: string; reference?: string; notes?: string; unitCost?: number;
  },
  companyId: string
) {
  await validateWarehouseAccess(input.warehouseId, companyId);
  if (input.quantity <= 0) throw new AppError("Quantity must be positive", 400);

  return prisma.$transaction(async (tx) => {
    const movement = await tx.stockMovement.create({ data: input as any });
    const outgoing = ["TRANSFER_OUT", "ADJUSTMENT_OUT", "WASTE", "RETURN_OUT", "SALE_OUT", "RECIPE_CONSUMPTION"];
    if (outgoing.includes(input.type)) {
      const stock = await tx.stockLevel.findFirst({
        where: { warehouseId: input.warehouseId, productId: input.productId, batchNumber: input.batchNumber ?? null },
      });
      if (!stock || Number(stock.quantity) < input.quantity) {
        throw new AppError("Insufficient stock", 400);
      }
      await tx.stockLevel.update({
        where: { id: stock.id },
        data: { quantity: { decrement: input.quantity } },
      });
    } else {
      const existing = await tx.stockLevel.findFirst({
        where: { warehouseId: input.warehouseId, productId: input.productId, batchNumber: input.batchNumber ?? null },
      });
      if (existing) {
        await tx.stockLevel.update({
          where: { id: existing.id },
          data: { quantity: { increment: input.quantity } },
        });
      } else {
        await tx.stockLevel.create({
          data: {
            warehouseId: input.warehouseId,
            productId: input.productId,
            quantity: input.quantity,
            batchNumber: input.batchNumber ?? null,
          },
        });
      }
    }
    return movement;
  });
}

export async function transferStockService(
  input: {
    fromWarehouseId: string; toWarehouseId: string; productId: string;
    quantity: number; batchNumber?: string;
  },
  companyId: string
) {
  await validateWarehouseAccess(input.fromWarehouseId, companyId);
  await validateWarehouseAccess(input.toWarehouseId, companyId);

  return prisma.$transaction(async (tx) => {
    const source = await tx.stockLevel.findFirst({
      where: { warehouseId: input.fromWarehouseId, productId: input.productId, batchNumber: input.batchNumber ?? null },
    });
    if (!source || Number(source.quantity) < input.quantity) {
      throw new AppError("Insufficient stock at source warehouse", 400);
    }
    await tx.stockLevel.update({
      where: { id: source.id },
      data: { quantity: { decrement: input.quantity } },
    });
    await tx.stockMovement.create({
      data: {
        warehouseId: input.fromWarehouseId, productId: input.productId,
        type: "TRANSFER_OUT", quantity: input.quantity, batchNumber: input.batchNumber,
        reference: `To:${input.toWarehouseId}`,
      },
    });
    await tx.stockMovement.create({
      data: {
        warehouseId: input.toWarehouseId, productId: input.productId,
        type: "TRANSFER_IN", quantity: input.quantity, batchNumber: input.batchNumber,
        reference: `From:${input.fromWarehouseId}`,
      },
    });
    const dest = await tx.stockLevel.findFirst({
      where: { warehouseId: input.toWarehouseId, productId: input.productId, batchNumber: input.batchNumber ?? null },
    });
    if (dest) {
      await tx.stockLevel.update({
        where: { id: dest.id },
        data: { quantity: { increment: input.quantity } },
      });
    } else {
      await tx.stockLevel.create({
        data: {
          warehouseId: input.toWarehouseId, productId: input.productId,
          quantity: input.quantity, batchNumber: input.batchNumber ?? null,
        },
      });
    }
    return { success: true };
  });
}

export async function lowStockAlertsService(warehouseId: string, companyId: string) {
  await validateWarehouseAccess(warehouseId, companyId);
  return prisma.stockLevel.findMany({
    where: {
      warehouseId,
      product: { reorderPoint: { not: null }, isActive: true },
    },
    include: { product: { select: { name: true, sku: true, reorderPoint: true } } },
    orderBy: { quantity: "asc" },
  }).then((rows) =>
    rows.filter((r) => Number(r.quantity) <= Number(r.product.reorderPoint ?? 0))
  );
}

export async function expiringStockService(warehouseId: string, companyId: string, daysThreshold = 7) {
  await validateWarehouseAccess(warehouseId, companyId);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + daysThreshold);
  return prisma.stockLevel.findMany({
    where: { warehouseId, expiryDate: { not: null, lte: threshold } },
    include: { product: { select: { name: true, sku: true } } },
    orderBy: { expiryDate: "asc" },
  });
}
