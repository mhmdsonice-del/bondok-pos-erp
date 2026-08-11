import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/security";

export async function createCustomerService(input: { companyId: string; name: string; phone?: string; email?: string; creditLimit?: number; notes?: string }) {
  return prisma.customer.create({ data: input });
}

export async function updateCustomerService(id: string, companyId: string, input: any) {
  const customer = await prisma.customer.findFirst({ where: { id, companyId } });
  if (!customer) throw new AppError("Customer not found", 404);
  return prisma.customer.update({ where: { id }, data: input });
}

export async function getCustomerProfileService(id: string, companyId: string) {
  const customer = await prisma.customer.findFirst({ where: { id, companyId }, include: { orders: { orderBy: { createdAt: "desc" }, take: 20 }, coupons: true } });
  if (!customer) throw new AppError("Customer not found", 404);
  return customer;
}

export async function searchCustomersService(companyId: string, query: string) {
  return prisma.customer.findMany({ where: { companyId, OR: [{ name: { contains: query, mode: "insensitive" } }, { phone: { contains: query } }] }, take: 20 });
}

export async function listCustomersService(companyId: string) {
  return prisma.customer.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 100 });
}

export async function addLoyaltyPointsService(customerId: string, companyId: string, orderTotal: number, ratio = 1) {
  const customer = await prisma.customer.findFirst({ where: { id: customerId, companyId } });
  if (!customer) throw new AppError("Customer not found", 404);
  const points = Math.floor(orderTotal * ratio);
  return prisma.customer.update({ where: { id: customerId }, data: { loyaltyPoints: { increment: points } } });
}

export async function redeemLoyaltyPointsService(customerId: string, companyId: string, points: number) {
  const customer = await prisma.customer.findFirst({ where: { id: customerId, companyId } });
  if (!customer) throw new AppError("Customer not found", 404);
  if (customer.loyaltyPoints < points) throw new AppError("Insufficient loyalty points", 400);
  return prisma.customer.update({ where: { id: customerId }, data: { loyaltyPoints: { decrement: points } } });
}

export async function chargeCustomerBalanceService(customerId: string, companyId: string, amount: number) {
  const customer = await prisma.customer.findFirst({ where: { id: customerId, companyId } });
  if (!customer) throw new AppError("Customer not found", 404);
  const newBalance = Number(customer.balance) + amount;
  if (newBalance > Number(customer.creditLimit)) throw new AppError("Credit limit exceeded", 400);
  return prisma.customer.update({ where: { id: customerId }, data: { balance: newBalance } });
}

export async function createCouponService(input: { code: string; customerId?: string; discountType: "PERCENT" | "FIXED"; value: number; expiryDate?: Date }) {
  return prisma.coupon.create({ data: input });
}