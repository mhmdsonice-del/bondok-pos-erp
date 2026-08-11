// ============================================================
// Bondok ERP/POS — Database Seed
// Creates default company + admin/cashier accounts + demo data
// Run: npx prisma db seed
// ============================================================

import { PrismaClient, UserRole, OrderType } from '@prisma/client';
import { hashSync } from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Bondok ERP database...\n');

  // ========================================
  // 1. COMPANY
  // ========================================
  const company = await prisma.company.upsert({
    where: { id: 'seed-company-01' },
    update: {},
    create: {
      id: 'seed-company-01',
      name: 'BONDOK Restaurants Group',
      taxNumber: 'EG-123456789',
      currency: 'EGP',
      language: 'ar',
    },
  });
  console.log('✅ Company:', company.name);

  // ========================================
  // 2. BRANCHES
  // ========================================
  const branch1 = await prisma.branch.upsert({
    where: { id: 'seed-branch-01' },
    update: {},
    create: {
      id: 'seed-branch-01',
      companyId: company.id,
      name: 'الفرع الرئيسي - وسط البلد',
      address: '١٢ شارع طلعت حرب، وسط البلد، القاهرة',
      phone: '+20 2 1234 5678',
    },
  });

  const branch2 = await prisma.branch.upsert({
    where: { id: 'seed-branch-02' },
    update: {},
    create: {
      id: 'seed-branch-02',
      companyId: company.id,
      name: 'فرع مدينة نصر',
      address: '٤٥ شارع عباس العقاد، مدينة نصر، القاهرة',
      phone: '+20 2 8765 4321',
    },
  });
  console.log('✅ Branches:', branch1.name, '+', branch2.name);

  // ========================================
  // 3. WAREHOUSES
  // ========================================
  const wh1 = await prisma.warehouse.upsert({
    where: { id: 'seed-wh-01' },
    update: {},
    create: { id: 'seed-wh-01', branchId: branch1.id, name: 'مخزن الفرع الرئيسي' },
  });
  const wh2 = await prisma.warehouse.upsert({
    where: { id: 'seed-wh-02' },
    update: {},
    create: { id: 'seed-wh-02', branchId: branch2.id, name: 'مخزن مدينة نصر' },
  });
  console.log('✅ Warehouses:', wh1.name, '+', wh2.name);

  // ========================================
  // 4. USERS (LOGIN CREDENTIALS)
  // ========================================
  const passwordHash = hashSync('admin123');

  // --- SUPER ADMIN ---
  const superAdmin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash },
    create: {
      id: 'seed-user-admin',
      companyId: company.id,
      fullName: 'محمد بندق',
      username: 'admin',
      email: 'admin@bondok.com',
      phone: '+20 100 000 0001',
      passwordHash,
      role: 'SUPER_ADMIN',
      employeeId: 'EMP-001',
      monthlySalary: 15000,
      joinDate: new Date('2024-01-01'),
    },
  });

  // --- BRANCH MANAGER ---
  const manager = await prisma.user.upsert({
    where: { username: 'manager' },
    update: { passwordHash },
    create: {
      id: 'seed-user-manager',
      companyId: company.id,
      fullName: 'أحمد مدير',
      username: 'manager',
      email: 'manager@bondok.com',
      phone: '+20 100 000 0002',
      passwordHash,
      role: 'BRANCH_MANAGER',
      employeeId: 'EMP-002',
      monthlySalary: 10000,
      joinDate: new Date('2024-03-01'),
    },
  });

  // --- CASHIER ---
  const cashier = await prisma.user.upsert({
    where: { username: 'cashier' },
    update: { passwordHash },
    create: {
      id: 'seed-user-cashier',
      companyId: company.id,
      fullName: 'سارة كاشير',
      username: 'cashier',
      email: 'cashier@bondok.com',
      phone: '+20 100 000 0003',
      passwordHash,
      role: 'CASHIER',
      employeeId: 'EMP-003',
      hourlyRate: 35,
      overtimeRate: 50,
      joinDate: new Date('2024-06-01'),
    },
  });

  // --- ACCOUNTANT ---
  const accountant = await prisma.user.upsert({
    where: { username: 'accountant' },
    update: { passwordHash },
    create: {
      id: 'seed-user-accountant',
      companyId: company.id,
      fullName: 'خالد محاسب',
      username: 'accountant',
      email: 'accountant@bondok.com',
      phone: '+20 100 000 0004',
      passwordHash,
      role: 'ACCOUNTANT',
      employeeId: 'EMP-004',
      monthlySalary: 12000,
      joinDate: new Date('2024-02-01'),
    },
  });

  // --- INVENTORY CLERK ---
  const inventory = await prisma.user.upsert({
    where: { username: 'inventory' },
    update: { passwordHash },
    create: {
      id: 'seed-user-inventory',
      companyId: company.id,
      fullName: 'نورا مخازن',
      username: 'inventory',
      email: 'inventory@bondok.com',
      phone: '+20 100 000 0005',
      passwordHash,
      role: 'INVENTORY_CLERK',
      employeeId: 'EMP-005',
      hourlyRate: 30,
      overtimeRate: 45,
      joinDate: new Date('2024-04-01'),
    },
  });

  // --- HR MANAGER ---
  const hr = await prisma.user.upsert({
    where: { username: 'hr' },
    update: { passwordHash },
    create: {
      id: 'seed-user-hr',
      companyId: company.id,
      fullName: 'داليا موارد بشرية',
      username: 'hr',
      email: 'hr@bondok.com',
      phone: '+20 100 000 0006',
      passwordHash,
      role: 'HR_MANAGER',
      employeeId: 'EMP-006',
      monthlySalary: 11000,
      joinDate: new Date('2024-01-15'),
    },
  });

  console.log('✅ Users created (password: admin123 for all):');
  console.log('   admin      - SUPER_ADMIN     (كل الصلاحيات)');
  console.log('   manager    - BRANCH_MANAGER  (مدير فرع)');
  console.log('   cashier    - CASHIER         (كاشير - نقطة بيع)');
  console.log('   accountant - ACCOUNTANT      (محاسب)');
  console.log('   inventory  - INVENTORY_CLERK (مسؤول مخازن)');
  console.log('   hr         - HR_MANAGER      (مدير موارد بشرية)');

  // ========================================
  // 5. USER-BRANCH ASSIGNMENTS
  // ========================================
  const userBranchData = [
    { userId: superAdmin.id, branchId: branch1.id },
    { userId: superAdmin.id, branchId: branch2.id },
    { userId: manager.id, branchId: branch1.id },
    { userId: cashier.id, branchId: branch1.id },
    { userId: accountant.id, branchId: branch1.id },
    { userId: inventory.id, branchId: branch1.id },
    { userId: hr.id, branchId: branch1.id },
  ];

  for (const ub of userBranchData) {
    await prisma.userBranch.upsert({
      where: { userId_branchId: { userId: ub.userId, branchId: ub.branchId } },
      update: {},
      create: ub,
    });
  }
  console.log('✅ User-branch assignments created');

  // ========================================
  // 6. PRODUCTS (قائمة طعام)
  // ========================================
  const units = [
    { id: 'seed-unit-piece', name: 'قطعة' },
    { id: 'seed-unit-kg', name: 'كجم' },
    { id: 'seed-unit-gram', name: 'جرام' },
    { id: 'seed-unit-liter', name: 'لتر' },
  ];
  for (const u of units) {
    await prisma.unit.upsert({ where: { id: u.id }, update: {}, create: u });
  }

  const categories = [
    { id: 'seed-cat-sandwich', name: 'ساندويتشات' },
    { id: 'seed-cat-meal', name: 'وجبات' },
    { id: 'seed-cat-drink', name: 'مشروبات' },
    { id: 'seed-cat-side', name: 'مقبلات' },
    { id: 'seed-cat-dessert', name: 'حلويات' },
  ];
  for (const c of categories) {
    await prisma.category.upsert({ where: { id: c.id }, update: {}, create: c });
  }

  const products = [
    { id: 'seed-prod-01', name: 'شاورما فراخ', sku: 'SHW-001', barcode: '6221000000010', costPrice: 25, sellPrice: 55, categoryId: 'seed-cat-sandwich', unitId: 'seed-unit-piece', reorderPoint: 20 },
    { id: 'seed-prod-02', name: 'شاورما لحمة', sku: 'SHW-002', barcode: '6221000000027', costPrice: 35, sellPrice: 75, categoryId: 'seed-cat-sandwich', unitId: 'seed-unit-piece', reorderPoint: 15 },
    { id: 'seed-prod-03', name: 'وجبة شاورما كومبو', sku: 'COM-001', barcode: '6221000000034', costPrice: 45, sellPrice: 90, categoryId: 'seed-cat-meal', unitId: 'seed-unit-piece', isComposite: true, reorderPoint: 10 },
    { id: 'seed-prod-04', name: 'بيبسي', sku: 'DRK-001', barcode: '6221000000041', costPrice: 5, sellPrice: 15, categoryId: 'seed-cat-drink', unitId: 'seed-unit-piece', reorderPoint: 50 },
    { id: 'seed-prod-05', name: 'مياه معدنية', sku: 'DRK-002', barcode: '6221000000058', costPrice: 2, sellPrice: 8, categoryId: 'seed-cat-drink', unitId: 'seed-unit-piece', reorderPoint: 80 },
    { id: 'seed-prod-06', name: 'بطاطس مقلية', sku: 'SID-001', barcode: '6221000000065', costPrice: 8, sellPrice: 25, categoryId: 'seed-cat-side', unitId: 'seed-unit-piece', reorderPoint: 30 },
    { id: 'seed-prod-07', name: 'كنافة', sku: 'DES-001', barcode: '6221000000072', costPrice: 15, sellPrice: 35, categoryId: 'seed-cat-dessert', unitId: 'seed-unit-piece', reorderPoint: 12 },
    { id: 'seed-prod-08', name: 'حمص', sku: 'SID-002', barcode: '6221000000089', costPrice: 6, sellPrice: 18, categoryId: 'seed-cat-side', unitId: 'seed-unit-piece', reorderPoint: 25 },
    { id: 'seed-prod-09', name: 'صدر فراخ (خام)', sku: 'RAW-001', barcode: '6221000000096', costPrice: 80, sellPrice: 120, categoryId: 'seed-cat-meal', unitId: 'seed-unit-kg', reorderPoint: 10 },
    { id: 'seed-prod-10', name: 'خبز شاورما', sku: 'RAW-002', barcode: '6221000000102', costPrice: 0.5, sellPrice: 0, categoryId: 'seed-cat-sandwich', unitId: 'seed-unit-piece', reorderPoint: 200 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: { ...p, companyId: company.id },
    });
  }
  console.log('✅ Products:', products.length, 'items');

  // ========================================
  // 7. RECIPE (وصفة الشاورما كومبو)
  // ========================================
  const recipeItems = [
    { productId: 'seed-prod-03', rawMaterialId: 'seed-prod-01', quantity: 1, unitName: 'قطعة' },
    { productId: 'seed-prod-03', rawMaterialId: 'seed-prod-06', quantity: 1, unitName: 'قطعة' },
    { productId: 'seed-prod-03', rawMaterialId: 'seed-prod-04', quantity: 1, unitName: 'قطعة' },
  ];

  await prisma.recipeItem.deleteMany({ where: { productId: 'seed-prod-03' } });
  for (const ri of recipeItems) {
    await prisma.recipeItem.create({ data: ri });
  }
  console.log('✅ Recipe: شاورما كومبو = شاورما فراخ + بطاطس + بيبسي');

  // ========================================
  // 8. STOCK LEVELS (مخزون أولي)
  // ========================================
  const stockData = [
    { warehouseId: wh1.id, productId: 'seed-prod-01', quantity: 100 },
    { warehouseId: wh1.id, productId: 'seed-prod-02', quantity: 80 },
    { warehouseId: wh1.id, productId: 'seed-prod-03', quantity: 50 },
    { warehouseId: wh1.id, productId: 'seed-prod-04', quantity: 200 },
    { warehouseId: wh1.id, productId: 'seed-prod-05', quantity: 300 },
    { warehouseId: wh1.id, productId: 'seed-prod-06', quantity: 150 },
    { warehouseId: wh1.id, productId: 'seed-prod-07', quantity: 40 },
    { warehouseId: wh1.id, productId: 'seed-prod-08', quantity: 100 },
    { warehouseId: wh1.id, productId: 'seed-prod-09', quantity: 30 },
    { warehouseId: wh1.id, productId: 'seed-prod-10', quantity: 500 },
  ];

  for (const s of stockData) {
    await prisma.stockLevel.upsert({
      where: { warehouseId_productId_batchNumber: { warehouseId: s.warehouseId, productId: s.productId, batchNumber: null } },
      update: { quantity: s.quantity },
      create: s,
    });
  }
  console.log('✅ Stock levels initialized');

  // ========================================
  // 9. TAX
  // ========================================
  await prisma.tax.upsert({
    where: { id: 'seed-tax-01' },
    update: {},
    create: { id: 'seed-tax-01', companyId: company.id, name: 'ضريبة القيمة المضافة', rate: 14, isActive: true },
  });
  console.log('✅ Tax: VAT 14%');

  // ========================================
  // 10. CUSTOMER
  // ========================================
  await prisma.customer.upsert({
    where: { id: 'seed-cust-01' },
    update: {},
    create: {
      id: 'seed-cust-01',
      companyId: company.id,
      name: 'عميل زائر (Walk-in)',
      phone: '+20 100 999 9999',
      loyaltyPoints: 0,
    },
  });
  console.log('✅ Customer: Walk-in');

  console.log('\n🎉 Seed complete!');
  console.log('═══════════════════════════════════════');
  console.log('🔑 بيانات الدخول الافتراضية:');
  console.log('   username: admin      password: admin123   (SUPER_ADMIN - كل الصلاحيات)');
  console.log('   username: manager    password: admin123   (BRANCH_MANAGER)');
  console.log('   username: cashier    password: admin123   (CASHIER - نقطة البيع)');
  console.log('   username: accountant password: admin123   (ACCOUNTANT)');
  console.log('   username: inventory  password: admin123   (INVENTORY_CLERK)');
  console.log('   username: hr         password: admin123   (HR_MANAGER)');
  console.log('═══════════════════════════════════════');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
