import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { requireAuth, requireRole } from "./auth";
import * as jwt from "../utils/jwt";

vi.mock("../utils/jwt", () => ({ verifyAccessToken: vi.fn() }));

function mockReq(header?: string, user?: any) {
  const req = { headers: { authorization: header ?? undefined }, user: user ?? undefined } as unknown as Request;
  return req;
}

function mockRes() {
  const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
  return res as Response;
}

const next = vi.fn() as NextFunction;

describe("requireAuth middleware", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when no Authorization header is present", () => {
    const res = mockRes();
    requireAuth(mockReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining("Missing") });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when Authorization header does not start with 'Bearer '", () => {
    const res = mockRes();
    requireAuth(mockReq("Basic xyz"), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining("Missing") });
  });

  it("calls next() when token is valid", () => {
    vi.mocked(jwt.verifyAccessToken).mockReturnValue({ userId: "u1", companyId: "c1", role: "ADMIN", branchIds: [] });
    requireAuth(mockReq("Bearer valid"), mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it("returns 401 when token verification throws", () => {
    vi.mocked(jwt.verifyAccessToken).mockImplementation(() => { throw new Error("bad token"); });
    const res = mockRes();
    requireAuth(mockReq("Bearer invalid"), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe("requireRole middleware", () => {
  it("calls next when user role matches", () => {
    const handler = requireRole("ADMIN", "CASHIER");
    handler(mockReq(undefined, { role: "CASHIER" }), mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it("returns 403 when user role does not match", () => {
    const handler = requireRole("ADMIN");
    const res = mockRes();
    handler(mockReq(undefined, { role: "CASHIER" }), res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when user is undefined", () => {
    const handler = requireRole("ADMIN");
    const res = mockRes();
    handler(mockReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});