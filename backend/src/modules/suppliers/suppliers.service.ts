import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/security";
import type { PaymentMethod } from "@prisma/client";

export async function createSupplierService(input: { companyId: string; name: string; phone?: string }) { return prisma.supplier.create({ data: input }); }
export async function listSuppliersService(companyId: string) { return prisma.supplier.findMany({ where: { companyId }, orderBy: { name: "asc" } }); }

export async function createPurchaseService(input: { supplierId: string; companyId: string; invoiceNo?: string; warehouseId: string; items: { productId: string; quantity: number; unitCost: number }[] }) {
  if (input.items.length === 0) throw new AppError("Purchase must include at least one item", 400);
  const supplier = await prisma.supplier.findFirst({ where: { id: input.supplierId, companyId: input.companyId } });
  if (!supplier) throw new AppError("Supplier not found", 404);
  const totalAmount = input.items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({ data: { supplierId: input.supplierId, invoiceNo: input.invoiceNo, totalAmount, items: { create: input.items } }, include: { items: true } });
    for (const item of input.items) {
      await tx.stockMovement.create({ data: { warehouseId: input.warehouseId, productId: item.productId, type: "PURCHASE_IN", quantity: item.quantity, reference: purchase.invoiceNo ?? purchase.id } });
      const existingLevel = await tx.stockLevel.findFirst({ where: { warehouseId: input.warehouseId, productId: item.productId, batchNumber: null } });
      if (existingLevel) await tx.stockLevel.update({ where: { id: existingLevel.id }, data: { quantity: { increment: item.quantity } } });
      else await tx.stockLevel.create({ data: { warehouseId: input.warehouseId, productId: item.productId, quantity: item.quantity } });
    }
    await tx.supplier.update({ where: { id: input.supplierId }, data: { balance: { increment: totalAmount } } });
    return purchase;
  });
}

export async function paySupplierService(purchaseId: string, companyId: string, amount: number, method: PaymentMethod) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUniqueOrThrow({ where: { id: purchaseId } });
    const supplier = await tx.supplier.findFirst({ where: { id: purchase.supplierId, companyId } });
    if (!supplier) throw new AppError("Supplier not found", 404);
    await tx.supplierPayment.create({ data: { purchaseId, amount, method } });
    await tx.purchase.update({ where: { id: purchaseId }, data: { paidAmount: { increment: amount } } });
    await tx.supplier.update({ where: { id: purchase.supplierId }, data: { balance: { decrement: amount } } });
    return { success: true };
  });
}

export async function supplierStatementService(supplierId: string, companyId: string) {
  const supplier = await prisma.supplier.findFirst({ where: { id: supplierId, companyId }, include: { purchases: { include: { items: true, payments: true }, orderBy: { createdAt: "desc" } } } });
  if (!supplier) throw new AppError("Supplier not found", 404);
  return supplier;
}