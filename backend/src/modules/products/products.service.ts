import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/security";

export async function createProductService(input: any) {
  const existingSku = await prisma.product.findFirst({ where: { sku: input.sku, companyId: input.companyId } });
  if (existingSku) throw new AppError("SKU already exists", 409);
  return prisma.product.create({ data: { companyId: input.companyId, categoryId: input.categoryId, unitId: input.unitId, sku: input.sku, barcode: input.barcode, qrCode: input.qrCode, name: input.name, nameEn: input.nameEn, description: input.description, imageUrl: input.imageUrl, costPrice: input.costPrice, sellPrice: input.sellPrice, isComposite: input.isComposite ?? false, reorderPoint: input.reorderPoint, variants: input.variants ? { create: input.variants } : undefined, modifiers: input.modifiers ? { create: input.modifiers } : undefined }, include: { variants: true, modifiers: true } });
}

export async function updateProductService(id: string, companyId: string, input: any) {
  const product = await prisma.product.findFirst({ where: { id, companyId } });
  if (!product) throw new AppError("Product not found", 404);
  return prisma.product.update({ where: { id }, data: input });
}

export async function deactivateProductService(id: string, companyId: string) {
  const product = await prisma.product.findFirst({ where: { id, companyId } });
  if (!product) throw new AppError("Product not found", 404);
  return prisma.product.update({ where: { id }, data: { isActive: false } });
}

export async function listProductsService(params: { companyId: string; categoryId?: string; search?: string; page?: number; pageSize?: number }) {
  const page = params.page ?? 1; const pageSize = params.pageSize ?? 50;
  const where: any = { companyId: params.companyId, isActive: true };
  if (params.categoryId) where.categoryId = params.categoryId;
  if (params.search) where.OR = [{ name: { contains: params.search, mode: "insensitive" } }, { nameEn: { contains: params.search, mode: "insensitive" } }, { barcode: { equals: params.search } }, { sku: { equals: params.search } }];
  const [items, total] = await Promise.all([prisma.product.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, include: { variants: true, modifiers: true, category: true }, orderBy: { name: "asc" } }), prisma.product.count({ where })]);
  return { items, total, page, pageSize };
}

export async function getProductByBarcodeService(companyId: string, barcode: string) {
  const product = await prisma.product.findFirst({ where: { companyId, barcode, isActive: true }, include: { variants: true, modifiers: true } });
  if (!product) throw new AppError("Product not found", 404);
  return product;
}