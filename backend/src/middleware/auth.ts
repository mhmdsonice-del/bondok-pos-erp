import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, AccessTokenPayload } from "../utils/jwt";

declare global { namespace Express { interface Request { user?: AccessTokenPayload; activeBranchId?: string; } } }

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Missing or malformed Authorization header" });
  try { req.user = verifyAccessToken(header.slice("Bearer ".length)); return next(); }
  catch { return res.status(401).json({ error: "Invalid or expired token" }); }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ error: "Insufficient permissions" });
    return next();
  };
}

export function requireBranchAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
  if (["SUPER_ADMIN", "ADMIN"].includes(req.user.role)) return next();
  const branchId = req.params.branchId || req.body.branchId || req.query.branchId;
  if (branchId && !req.user.branchIds.includes(String(branchId))) return res.status(403).json({ error: "No access to this branch" });
  return next();
}

export function resolveBranch(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
  const headerBranchId = req.headers["x-active-branch"] as string | undefined;
  if (headerBranchId) {
    if (["SUPER_ADMIN", "ADMIN"].includes(req.user.role)) { req.activeBranchId = headerBranchId; return next(); }
    if (!req.user.branchIds.includes(headerBranchId)) return res.status(403).json({ error: "No access to the specified branch", code: "BRANCH_ACCESS_DENIED" });
    req.activeBranchId = headerBranchId; return next();
  }
  if (req.user.branchIds.length === 1) { req.activeBranchId = req.user.branchIds[0]; return next(); }
  return res.status(400).json({ error: "Branch selection required", code: "BRANCH_REQUIRED", availableBranches: req.user.branchIds });
}

export function getEffectiveBranchId(req: Request): string | undefined {
  return req.activeBranchId ?? (req.body?.branchId as string) ?? (req.params?.branchId) ?? (req.query?.branchId as string);
}