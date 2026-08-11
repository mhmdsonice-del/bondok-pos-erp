import { prisma } from "../../config/prisma";

export async function salesReportRows(branchId: string, range: { start: Date; end: Date }) {
  const orders = await prisma.order.findMany({ where: { branchId, status: "COMPLETED", createdAt: { gte: range.start, lte: range.end } }, include: { customer: true, createdBy: { select: { fullName: true } } }, orderBy: { createdAt: "desc" } });
  return orders.map((o) => ({ orderNumber: o.orderNumber, date: o.createdAt.toISOString().slice(0, 16).replace("T", " "), cashier: o.createdBy.fullName, customer: o.customer?.name ?? "زائر", subtotal: Number(o.subtotal), discount: Number(o.discountAmount), tax: Number(o.taxAmount), total: Number(o.totalAmount), paymentStatus: o.paymentStatus }));
}

export async function productsReportRows(branchId: string, range: { start: Date; end: Date }) {
  const orders = await prisma.order.findMany({ where: { branchId, status: "COMPLETED", createdAt: { gte: range.start, lte: range.end } }, include: { items: { include: { product: true } } } });
  const map = new Map<string, { name: string; sku: string; quantitySold: number; totalRevenue: number; totalCost: number }>();
  for (const o of orders) for (const i of o.items) {
    const key = i.productId; const prev = map.get(key) || { name: i.product.name, sku: i.product.sku, quantitySold: 0, totalRevenue: 0, totalCost: 0 };
    prev.quantitySold += Number(i.quantity); prev.totalRevenue += Number(i.unitPrice) * Number(i.quantity); prev.totalCost += Number(i.product.costPrice) * Number(i.quantity); map.set(key, prev);
  }
  return Array.from(map.entries()).map(([id, v]) => ({ productId: id, name: v.name, sku: v.sku, quantitySold: v.quantitySold, totalRevenue: Math.round(v.totalRevenue * 100) / 100, totalCost: Math.round(v.totalCost * 100) / 100, grossProfit: Math.round((v.totalRevenue - v.totalCost) * 100) / 100 }));
}

export async function profitReportRows(branchId: string, range: { start: Date; end: Date }) {
  const orders = await prisma.order.findMany({ where: { branchId, status: "COMPLETED", createdAt: { gte: range.start, lte: range.end } } });
  const byDate = new Map<string, { orderCount: number; revenue: number; estimatedCost: number }>();
  for (const o of orders) {
    const d = o.createdAt.toISOString().slice(0, 10); const prev = byDate.get(d) || { orderCount: 0, revenue: 0, estimatedCost: 0 };
    prev.orderCount++; prev.revenue += Number(o.totalAmount); prev.estimatedCost += Number(o.subtotal) * 0.6; byDate.set(d, prev);
  }
  return Array.from(byDate.entries()).map(([date, v]) => ({ date, orderCount: v.orderCount, revenue: Math.round(v.revenue * 100) / 100, estimatedCost: Math.round(v.estimatedCost * 100) / 100, grossProfit: Math.round((v.revenue - v.estimatedCost) * 100) / 100 }));
}

export async function employeesReportRows(branchId: string, range: { start: Date; end: Date }) {
  const orders = await prisma.order.findMany({ where: { branchId, status: "COMPLETED", createdAt: { gte: range.start, lte: range.end } }, include: { createdBy: { select: { fullName: true, role: true } } } });
  const map = new Map();
  for (const o of orders) { const prev = map.get(o.createdById) || { employeeName: o.createdBy.fullName, role: o.createdBy.role, invoiceCount: 0, totalSales: 0 }; prev.invoiceCount++; prev.totalSales += Number(o.totalAmount); map.set(o.createdById, prev); }
  return Array.from(map.values()).map((v) => ({ ...v, averageInvoice: v.invoiceCount > 0 ? Math.round((v.totalSales / v.invoiceCount) * 100) / 100 : 0 }));
}

export async function customersReportRows(branchId: string, range: { start: Date; end: Date }) {
  const orders = await prisma.order.findMany({ where: { branchId, status: "COMPLETED", createdAt: { gte: range.start, lte: range.end } }, include: { customer: true } });
  const map = new Map();
  for (const o of orders) { const c = o.customer; if (!c) continue; const prev = map.get(c.id) || { customerName: c.name, phone: c.phone ?? "", loyaltyPoints: c.loyaltyPoints, invoiceCount: 0, totalSpent: 0 }; prev.invoiceCount++; prev.totalSpent += Number(o.totalAmount); map.set(c.id, prev); }
  return Array.from(map.values());
}

export async function suppliersReportRows(companyId: string) {
  return prisma.supplier.findMany({ where: { companyId }, include: { purchases: { include: { payments: true } } } }).then((suppliers) => suppliers.map((s) => ({ supplierName: s.name, phone: s.phone ?? "", purchaseCount: s.purchases.length, totalPurchased: s.purchases.reduce((sum, p) => sum + Number(p.totalAmount), 0), totalPaid: s.purchases.reduce((sum, p) => sum + p.payments.reduce((a, pp) => a + Number(pp.amount), 0), 0), outstandingBalance: Number(s.balance) })));
}

export async function taxReportRows(branchId: string, range: { start: Date; end: Date }) {
  const orders = await prisma.order.findMany({ where: { branchId, status: "COMPLETED", createdAt: { gte: range.start, lte: range.end } } });
  const byDate = new Map<string, { taxableSales: number; taxCollected: number }>();
  for (const o of orders) { const d = o.createdAt.toISOString().slice(0, 10); const prev = byDate.get(d) || { taxableSales: 0, taxCollected: 0 }; prev.taxableSales += Number(o.subtotal) - Number(o.discountAmount); prev.taxCollected += Number(o.taxAmount); byDate.set(d, prev); }
  return Array.from(byDate.entries()).map(([date, v]) => ({ date, taxableSales: Math.round(v.taxableSales * 100) / 100, taxCollected: Math.round(v.taxCollected * 100) / 100 }));
}

export async function cashReportRows(branchId: string, range: { start: Date; end: Date }) {
  const registers = await prisma.cashRegister.findMany({ where: { branchId, openedAt: { gte: range.start, lte: range.end } }, include: { movements: true } });
  return registers.map((r) => ({ registerId: r.id, openedAt: r.openedAt.toISOString(), closedAt: r.closedAt?.toISOString() ?? null, openingAmount: Number(r.openingAmount), closingAmount: r.closingAmount ? Number(r.closingAmount) : null, totalReceipts: r.movements.filter((m) => m.type === "RECEIPT").reduce((s, m) => s + Number(m.amount), 0), totalPayments: r.movements.filter((m) => m.type === "PAYMENT").reduce((s, m) => s + Number(m.amount), 0), isClosed: r.isClosed }));
}

export async function exportCsvReportService() { return { message: "CSV export endpoint" }; }