import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  stockLevel: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  warehouse: { findUnique: vi.fn() },
  $transaction: vi.fn((fn: any) => fn(mockPrisma)),
};

vi.mock("../../config/prisma", () => ({ prisma: mockPrisma }));

describe("adjustStockService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a new stock level when none exists", async () => {
    mockPrisma.warehouse.findUnique.mockResolvedValue({ id: "w1", branch: { companyId: "c1", id: "b1" } });
    mockPrisma.stockLevel.findFirst.mockResolvedValue(null);
    mockPrisma.stockLevel.create.mockResolvedValue({ id: "s1", warehouseId: "w1", productId: "p1", quantity: 10 });
    const { adjustStockService } = await import("./inventory.service");
    const result = await adjustStockService("w1", "p1", 10, "c1");
    expect(result.quantity).toBe(10);
  });

  it("updates existing stock level", async () => {
    mockPrisma.warehouse.findUnique.mockResolvedValue({ id: "w1", branch: { companyId: "c1", id: "b1" } });
    mockPrisma.stockLevel.findFirst.mockResolvedValue({ id: "existing", warehouseId: "w1", productId: "p1", quantity: 5 });
    mockPrisma.stockLevel.update.mockResolvedValue({ id: "existing", warehouseId: "w1", productId: "p1", quantity: 15 });
    const { adjustStockService } = await import("./inventory.service");
    const result = await adjustStockService("w1", "p1", 10, "c1");
    expect(result.quantity).toBe(15);
  });
});