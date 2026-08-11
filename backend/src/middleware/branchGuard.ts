import { prisma } from "../config/prisma";
import { AppError } from "../middleware/security";

export async function verifyBranchOwnership(table: string, resourceId: string, branchId: string): Promise<void> {
  let record: { branchId?: string } | null = null;
  switch (table) {
    case "Order": record = await prisma.order.findUnique({ where: { id: resourceId }, select: { branchId: true } }); break;
    case "CashRegister": record = await prisma.cashRegister.findUnique({ where: { id: resourceId }, select: { branchId: true } }); break;
    case "WasteEntry": record = await prisma.wasteEntry.findUnique({ where: { id: resourceId }, select: { branchId: true } }); break;
    case "Expense": record = await prisma.expense.findUnique({ where: { id: resourceId }, select: { branchId: true } }); break;
    default: throw new AppError(`Unknown resource type: ${table}`, 500);
  }
  if (!record) throw new AppError(`${table} not found`, 404);
  if (record.branchId && record.branchId !== branchId) throw new AppError(`${table} does not belong to this branch`, 403);
}

export async function verifyBranchCompany(branchId: string, companyId: string): Promise<void> {
  const branch = await prisma.branch.findUnique({ where: { id: branchId }, select: { companyId: true } });
  if (!branch) throw new AppError("Branch not found", 404);
  if (branch.companyId !== companyId) throw new AppError("Branch does not belong to this company", 403);
}

export async function verifyWarehouseCompany(warehouseId: string, companyId: string): Promise<void> {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: warehouseId },
    include: { branch: { select: { companyId: true } } },
  });
  if (!warehouse) throw new AppError("Warehouse not found", 404);
  if (warehouse.branch.companyId !== companyId) throw new AppError("Warehouse does not belong to your company", 403);
}

/** Verify that the resource (by ID + table) belongs to the given company */
export async function verifyCompanyOwnership(table: string, resourceId: string, companyId: string): Promise<void> {
  let record: { branch?: { companyId?: string } } | null = null;
  switch (table) {
    case "Order":
      record = await prisma.order.findUnique({
        where: { id: resourceId },
        include: { branch: { select: { companyId: true } } },
      });
      break;
    case "Product":
      record = await prisma.product.findUnique({
        where: { id: resourceId },
        select: { companyId: true } as any,
      });
      break;
    case "Customer":
      record = await prisma.customer.findUnique({
        where: { id: resourceId },
        select: { companyId: true } as any,
      });
      break;
    case "Supplier":
      record = await prisma.supplier.findUnique({
        where: { id: resourceId },
        select: { companyId: true } as any,
      });
      break;
    default: throw new AppError(`Unknown resource type for company isolation: ${table}`, 500);
  }
  if (!record) throw new AppError(`${table} not found`, 404);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recordCompanyId = (record as any).companyId ?? (record as any).branch?.companyId;
  if (recordCompanyId && recordCompanyId !== companyId) {
    throw new AppError("Resource does not belong to your company", 403);
  }
}
