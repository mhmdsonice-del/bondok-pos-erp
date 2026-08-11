import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const companyName = process.env.SEED_COMPANY_NAME ?? "Bondok";
  const branchName = process.env.SEED_BRANCH_NAME ?? "الفرع الرئيسي";

  if (!adminPassword) {
    console.error("❌ SEED_ADMIN_PASSWORD is required.");
    process.exit(1);
  }

  const existingAdmin = await prisma.user.findUnique({ where: { username: adminUsername } });
  if (existingAdmin) {
    console.log(`ℹ️  User "${adminUsername}" already exists — skipping seed.`);
    return;
  }

  const company = await prisma.company.create({ data: { name: companyName, currency: "EGP", language: "ar" } });
  const branch = await prisma.branch.create({ data: { companyId: company.id, name: branchName } });
  await prisma.warehouse.create({ data: { branchId: branch.id, name: `${branchName} - المخزن الرئيسي` } });

  const passwordHash = await hashPassword(adminPassword);
  const admin = await prisma.user.create({
    data: {
      companyId: company.id,
      fullName: "مدير النظام",
      username: adminUsername,
      passwordHash,
      role: "SUPER_ADMIN",
      branches: { create: [{ branchId: branch.id }] },
    },
  });

  console.log("✅ Seed complete!");
}

main().catch((err) => { console.error("❌ Seed failed:", err); process.exit(1); }).finally(() => prisma.$disconnect());