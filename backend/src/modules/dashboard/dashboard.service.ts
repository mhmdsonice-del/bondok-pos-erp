import { prisma } from "../../config/prisma";

export async function dashboardSummaryService(branchId: string, range: { start: Date; end: Date }) {
  const orders = await prisma.order.findMany({ where: { branchId, status: "COMPLETED", createdAt: { gte: range.start, lte: range.end } }, include: { items: { include: { product: true } } } });
  const totalSales = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
  const invoiceCount = orders.length;
  const averageInvoice = invoiceCount > 0 ? totalSales / invoiceCount : 0;
  const totalCost = orders.reduce((s, o) => s + o.items.reduce((si, i) => si + Number(i.product.costPrice) * Number(i.quantity), 0), 0);
  const grossProfit = totalSales - totalCost;
  return { totalSales: Math.round(totalSales * 100) / 100, invoiceCount, averageInvoice: Math.round(averageInvoice * 100) / 100, grossProfit: Math.round(grossProfit * 100) / 100 };
}

export async function topProductsService(branchId: string, range: { start: Date; end: Date }) {
  const orders = await prisma.order.findMany({ where: { branchId, status: "COMPLETED", createdAt: { gte: range.start, lte: range.end } }, include: { items: { include: { product: true } } } });
  const productMap = new Map<string, { name: string; quantitySold: number }>();
  for (const order of orders) for (const item of order.items) { const key = item.productId; const prev = productMap.get(key) || { name: item.product.name, quantitySold: 0 }; prev.quantitySold += Number(item.quantity); productMap.set(key, prev); }
  return Array.from(productMap.entries()).map(([productId, data]) => ({ productId, product: { name: data.name }, quantitySold: data.quantitySold })).sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 10);
}

export async function dailySalesService(branchId: string) {
  const end = new Date();
  const start = new Date(); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0);
  const orders = await prisma.order.findMany({ where: { branchId, status: "COMPLETED", createdAt: { gte: start, lte: end } } });
  const salesByDay = new Map<string, number>();
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) salesByDay.set(d.toISOString().slice(0, 10), 0);
  for (const o of orders) { const day = o.createdAt.toISOString().slice(0, 10); salesByDay.set(day, (salesByDay.get(day) || 0) + Number(o.totalAmount)); }
  return Array.from(salesByDay.entries()).map(([date, total]) => ({ date, total: Math.round(total * 100) / 100 }));
}

export async function smartAlertsService(branchId: string) {
  const warehouse = await prisma.warehouse.findFirst({ where: { branchId } });
  if (!warehouse) return [];
  const low = await prisma.stockLevel.findMany({ where: { warehouseId: warehouse.id, product: { reorderPoint: { not: null } } }, include: { product: { select: { name: true, reorderPoint: true } } } });
  const expiring = await prisma.stockLevel.findMany({ where: { warehouseId: warehouse.id, expiryDate: { not: null, lte: new Date(Date.now() + 7 * 86400000) } }, include: { product: { select: { name: true } } } });
  const alerts = [...low.filter((s) => Number(s.quantity) <= Number(s.product.reorderPoint ?? 0)).map((s) => ({ type: "LOW_STOCK", message: `${s.product.name}: ${Number(s.quantity)} وحدة (الحد: ${s.product.reorderPoint})` })), ...expiring.map((s) => ({ type: "EXPIRING", message: `${s.product.name}: تنتهي صلاحيته قريباً` }))];
  return alerts.slice(0, 10);
}