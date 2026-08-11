import { describe, it, expect, beforeAll, vi } from "vitest";

vi.mock("../config/env", () => ({ env: { JWT_ACCESS_SECRET: "test_access_secret_16_chars", JWT_REFRESH_SECRET: "test_refresh_secret_16_chars", JWT_ACCESS_EXPIRES_IN: "1h", JWT_REFRESH_EXPIRES_IN: "7d" } }));

describe("JWT utils", () => {
  let signAccessToken: any, signRefreshToken: any, verifyAccessToken: any, verifyRefreshToken: any;

  beforeAll(async () => {
    const mod = await import("./jwt");
    signAccessToken = mod.signAccessToken;
    signRefreshToken = mod.signRefreshToken;
    verifyAccessToken = mod.verifyAccessToken;
    verifyRefreshToken = mod.verifyRefreshToken;
  });

  it("signs and verifies an access token", () => {
    const payload = { userId: "u1", companyId: "c1", role: "ADMIN", branchIds: ["b1"] };
    const token = signAccessToken(payload);
    expect(typeof token).toBe("string");
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe("u1");
    expect(decoded.role).toBe("ADMIN");
  });

  it("signs and verifies a refresh token", () => {
    const payload = { userId: "u1", tokenVersion: 0 };
    const token = signRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe("u1");
  });

  it("throws on invalid access token", () => {
    expect(() => verifyAccessToken("invalid")).toThrow();
  });
});