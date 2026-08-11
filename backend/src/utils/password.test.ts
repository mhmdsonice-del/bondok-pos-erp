import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password utils", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("StrongP@ss1");
    expect(hash).not.toBe("StrongP@ss1");
    expect(await verifyPassword("StrongP@ss1", hash)).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("StrongP@ss1");
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("returns false for invalid hash", async () => {
    expect(await verifyPassword("anything", "not_a_hash")).toBe(false);
  });
});