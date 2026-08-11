import { prisma } from "../../config/prisma";

export async function createTaxService(input: { companyId: string; name: string; rate: number }) {
  return prisma.tax.create({ data: input });
}

export async function listTaxesService(companyId: string) {
  return prisma.tax.findMany({ where: { companyId, isActive: true } });
}

export async function updateCompanySettingsService(companyId: string, input: { name?: string; logoUrl?: string; taxNumber?: string; currency?: string; language?: string }) {
  return prisma.company.update({ where: { id: companyId }, data: input });
}

export async function exportBackupService(companyId: string) {
  const company = await prisma.company.findUniqueOrThrow({ where: { id: companyId }, include: { branches: { include: { warehouses: true } }, users: true, products: true, customers: true, suppliers: true, taxes: true } });
  return { exportedAt: new Date().toISOString(), data: company };
}