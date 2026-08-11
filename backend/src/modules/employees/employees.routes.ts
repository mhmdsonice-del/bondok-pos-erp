import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../../middleware/auth";
import { createEmployeeService, listEmployeesService, updateEmployeeRoleService, deactivateEmployeeService, clockInOutService, attendanceReportService, submitPerformanceReviewService, topSellingEmployeesService } from "./employees.service";

const router = Router();
router.use(requireAuth);

const roles = ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER", "CASHIER", "KITCHEN", "ACCOUNTANT", "INVENTORY_CLERK", "HR_MANAGER"] as const;

router.post("/", requireRole("SUPER_ADMIN", "ADMIN"), async (req, res, next) => {
  try { const input = z.object({ fullName: z.string().min(1), username: z.string().min(3), email: z.string().email().optional(), phone: z.string().optional(), password: z.string().min(8), role: z.enum(roles), branchIds: z.array(z.string().uuid()) }).parse(req.body); res.status(201).json(await createEmployeeService({ ...(input as any), companyId: req.user!.companyId })); } catch (err) { next(err); }
});

router.get("/", async (req, res, next) => { try { res.json(await listEmployeesService(req.user!.companyId)); } catch (err) { next(err); } });

router.patch("/:id/role", requireRole("SUPER_ADMIN", "ADMIN"), async (req, res, next) => {
  try { const { role } = z.object({ role: z.enum(roles) }).parse(req.body); res.json(await updateEmployeeRoleService(req.params.id, req.user!.companyId, role)); } catch (err) { next(err); }
});

router.delete("/:id", requireRole("SUPER_ADMIN", "ADMIN"), async (req, res, next) => { try { res.json(await deactivateEmployeeService(req.params.id, req.user!.companyId)); } catch (err) { next(err); } });

router.post("/clock", async (req, res, next) => {
  try { const { branchId, status } = z.object({ branchId: z.string().uuid(), status: z.enum(["CHECK_IN","CHECK_OUT","BREAK_START","BREAK_END"]) }).parse(req.body); res.status(201).json(await clockInOutService(req.user!.userId, branchId, status)); } catch (err) { next(err); }
});

router.get("/:id/attendance", async (req, res, next) => {
  try { const { start, end } = z.object({ start: z.coerce.date(), end: z.coerce.date() }).parse(req.query); res.json(await attendanceReportService(req.params.id, start, end)); } catch (err) { next(err); }
});

router.post("/reviews", requireRole("SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"), async (req, res, next) => {
  try { const input = z.object({ userId: z.string().uuid(), periodStart: z.coerce.date(), periodEnd: z.coerce.date(), score: z.number().min(0).max(100), notes: z.string().optional() }).parse(req.body); res.status(201).json(await submitPerformanceReviewService(req.user!.companyId, input as any)); } catch (err) { next(err); }
});

router.get("/top-selling", async (req, res, next) => {
  try { const { branchId, start, end } = z.object({ branchId: z.string().uuid(), start: z.coerce.date(), end: z.coerce.date() }).parse(req.query); res.json(await topSellingEmployeesService(branchId, start, end)); } catch (err) { next(err); }
});

export default router;