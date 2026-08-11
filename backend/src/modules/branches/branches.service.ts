import { prisma } from "../../config/prisma";

export async function createBranchService(input: { companyId: string; name: string; address?: string; phone?: string }) {
  const branch = await prisma.branch.create({ data: input });
  await prisma.warehouse.create({ data: { branchId: branch.id, name: `${input.name} - Main Warehouse` } });
  return branch;
}

export async function listBranchesService(companyId: string) {
  return prisma.branch.findMany({ where: { companyId }, include: { warehouses: true } });
}

export async function transferProductBetweenBranchesService(params: { fromBranchId: string; toBranchId: string; productId: string; quantity: number }) {
  const [fromWarehouse, toWarehouse] = await Promise.all([
    prisma.warehouse.findFirstOrThrow({ where: { branchId: params.fromBranchId } }),
    prisma.warehouse.findFirstOrThrow({ where: { branchId: params.toBranchId } }),
  ]);
  const source = await prisma.stockLevel.findFirst({ where: { warehouseId: fromWarehouse.id, productId: params.productId } });
  if (!source || Number(source.quantity) < params.quantity) throw new Error("Insufficient stock");
  await prisma.stockLevel.update({ where: { id: source.id }, data: { quantity: { decrement: params.quantity } } });
  await prisma.stockMovement.create({ data: { warehouseId: fromWarehouse.id, productId: params.productId, type: "TRANSFER_OUT", quantity: params.quantity, reference: `To:${params.toBranchId}` } });
  await prisma.stockMovement.create({ data: { warehouseId: toWarehouse.id, productId: params.productId, type: "TRANSFER_IN", quantity: params.quantity, reference: `From:${params.fromBranchId}` } });
  const dest = await prisma.stockLevel.findFirst({ where: { warehouseId: toWarehouse.id, productId: params.productId } });
  if (dest) await prisma.stockLevel.update({ where: { id: dest.id }, data: { quantity: { increment: params.quantity } } });
  else await prisma.stockLevel.create({ data: { warehouseId: toWarehouse.id, productId: params.productId, quantity: params.quantity } });
  return { success: true };
}

export async function consolidatedBranchReportService(companyId: string) {
  const branches = await prisma.branch.findMany({ where: { companyId }, include: { orders: { where: { status: "COMPLETED" } } } });
  return branches.map((b) => ({ branchId: b.id, branchName: b.name, totalRevenue: b.orders.reduce((s, o) => s + Number(o.totalAmount), 0), orderCount: b.orders.length }));
}