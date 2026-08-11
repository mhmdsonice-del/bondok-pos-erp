import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  cashRegister: { findFirst: vi.fn(), create: vi.fn(), findUniqueOrThrow: vi.fn(), update: vi.fn(), findMany: vi.fn() },
  cashMovement: { create: vi.fn() },
  auditLog: { create: vi.fn() },
  $transaction: vi.fn((fn: any) => fn(mockPrisma)),
};

vi.mock("../../config/prisma", () => ({ prisma: mockPrisma }));

describe("openCashRegisterService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("opens a new cash register when none is open", async () => {
    mockPrisma.cashRegister.findFirst.mockResolvedValue(null);
    mockPrisma.cashRegister.create.mockResolvedValue({ id: "r1", branchId: "b1", openingAmount: 500 });
    mockPrisma.cashMovement.create.mockResolvedValue({ id: "m1", type: "OPENING", amount: 500 });

    const { openCashRegisterService } = await import("./cashRegister.service");
    const result = await openCashRegisterService("b1", "u1", 500);
    expect(result.id).toBe("r1");
  });

  it("throws when a register is already open", async () => {
    mockPrisma.cashRegister.findFirst.mockResolvedValue({ id: "existing", isClosed: false });
    const { openCashRegisterService } = await import("./cashRegister.service");
    await expect(openCashRegisterService("b1", "u1", 500)).rejects.toThrow(/already open/);
  });
});

describe("closeCashRegisterService", () => {
  it("closes register and calculates variance", async () => {
    mockPrisma.cashRegister.findUniqueOrThrow.mockResolvedValue({
      id: "r1", openingAmount: 500, isClosed: false,
      movements: [{ type: "RECEIPT", amount: 300 }, { type: "PAYMENT", amount: 50 }],
    });
    mockPrisma.cashMovement.create.mockResolvedValue({});
    mockPrisma.cashRegister.update.mockResolvedValue({ closedAt: new Date(), closingAmount: 750 });
    mockPrisma.auditLog.create.mockResolvedValue({});

    const { closeCashRegisterService } = await import("./cashRegister.service");
    const result = await closeCashRegisterService("r1", "u1", 750);
    expect(result.variance).toBe(0); // 500 + 300 - 50 = 750, variance = 750 - 750 = 0
  });

  it("throws when already closed", async () => {
    mockPrisma.cashRegister.findUniqueOrThrow.mockResolvedValue({ id: "r1", isClosed: true, movements: [] });
    const { closeCashRegisterService } = await import("./cashRegister.service");
    await expect(closeCashRegisterService("r1", "u1", 100)).rejects.toThrow(/already closed/);
  });
});