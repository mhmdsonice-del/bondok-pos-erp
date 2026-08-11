import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = { order: { findMany: vi.fn() }, supplier: { findMany: vi.fn() } };
vi.mock("../../config/prisma", () => ({ prisma: mockPrisma }));

describe("salesReportRows", () => {
  it("returns formatted sales rows", async () => {
    mockPrisma.order.findMany.mockResolvedValue([
      {
        orderNumber: "ORD-001",
        createdAt: new Date("2026-08-01"),
        createdBy: { fullName: "أحمد" },
        customer: { name: "عميل ١" },
        subtotal: 100,
        discountAmount: 0,
        taxAmount: 14,
        totalAmount: 114,
        paymentStatus: "PAID",
      },
    ]);

    const { salesReportRows } = await import("./reports.service");
    const rows = await salesReportRows("b1", { start: new Date("2026-01-01"), end: new Date("2026-12-31") });
    expect(rows).toHaveLength(1);
    expect(rows[0].orderNumber).toBe("ORD-001");
    expect(rows[0].total).toBe(114);
  });
});