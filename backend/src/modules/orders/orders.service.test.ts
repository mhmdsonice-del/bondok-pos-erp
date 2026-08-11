import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  branch: { findFirst: vi.fn() },
  product: { findMany: vi.fn() },
  order: { create: vi.fn() },
  orderCounter: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  coupon: { findUnique: vi.fn() },
  $transaction: vi.fn((fn: any) => fn(mockPrisma)),
};

vi.mock("../../config/prisma", () => ({ prisma: mockPrisma }));

describe("createOrderService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates an order successfully", async () => {
    mockPrisma.branch.findFirst.mockResolvedValue({ id: "b1", companyId: "c1" });
    mockPrisma.product.findMany.mockResolvedValue([{ id: "p1", name: "شاورما", sellPrice: 85, companyId: "c1" }]);
    mockPrisma.orderCounter.findUnique.mockResolvedValue({ counter: 5 });
    mockPrisma.orderCounter.update.mockResolvedValue({ counter: 6 });
    mockPrisma.order.create.mockResolvedValue({
      id: "o1", orderNumber: "BR-20260810-000006", totalAmount: 85, items: [{ productId: "p1", quantity: 1, unitPrice: 85 }],
    });

    const { createOrderService } = await import("./orders.service");
    const order = await createOrderService({
      branchId: "b1", createdById: "u1", companyId: "c1", type: "DINE_IN",
      items: [{ productId: "p1", quantity: 1 }],
    });

    expect(order.orderNumber).toBeDefined();
    expect(order.totalAmount).toBe(85);
  });

  it("throws when no items are provided", async () => {
    const { createOrderService } = await import("./orders.service");
    await expect(
      createOrderService({ branchId: "b1", createdById: "u1", companyId: "c1", type: "DINE_IN", items: [] })
    ).rejects.toThrow(/at least one item/);
  });

  it("throws when branch not found", async () => {
    mockPrisma.branch.findFirst.mockResolvedValue(null);
    mockPrisma.product.findMany.mockResolvedValue([{ id: "p1", name: "شاورما", sellPrice: 85, companyId: "c1" }]);

    const { createOrderService } = await import("./orders.service");
    await expect(
      createOrderService({ branchId: "b1", createdById: "u1", companyId: "c1", type: "DINE_IN", items: [{ productId: "p1", quantity: 1 }] })
    ).rejects.toThrow(/Branch not found/);
  });

  it("throws when a product is not found", async () => {
    mockPrisma.branch.findFirst.mockResolvedValue({ id: "b1", companyId: "c1" });
    mockPrisma.product.findMany.mockResolvedValue([]);

    const { createOrderService } = await import("./orders.service");
    await expect(
      createOrderService({ branchId: "b1", createdById: "u1", companyId: "c1", type: "DINE_IN", items: [{ productId: "p1", quantity: 1 }] })
    ).rejects.toThrow(/not found/);
  });

  it("rejects invalid expired coupon", async () => {
    mockPrisma.branch.findFirst.mockResolvedValue({ id: "b1", companyId: "c1" });
    mockPrisma.product.findMany.mockResolvedValue([{ id: "p1", name: "شاورما", sellPrice: 100, companyId: "c1" }]);
    mockPrisma.coupon.findUnique.mockResolvedValue({ id: "coupon-1", code: "EXPIRED", discountType: "PERCENT", value: 10, expiryDate: new Date("2020-01-01"), isUsed: false });

    const { createOrderService } = await import("./orders.service");
    await expect(
      createOrderService({ branchId: "b1", createdById: "u1", companyId: "c1", type: "DINE_IN", couponCode: "EXPIRED", items: [{ productId: "p1", quantity: 1 }] })
    ).rejects.toThrow(/expired/);
  });
});