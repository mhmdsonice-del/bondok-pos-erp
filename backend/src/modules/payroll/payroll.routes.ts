import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../../middleware/auth";
import {
  calculatePayrollService,
  generatePayrollRecordService,
  approvePayrollService,
  payPayrollService,
  lockPayrollService,
  getEmployeePayrollService,
  getPayrollRecordService,
} from "./payroll.service";

const router = Router();
router.use(requireAuth, requireRole("SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "HR_MANAGER"));

// GET payroll for an employee
router.get("/employee/:userId", async (req, res, next) => {
  try {
    res.json(await getEmployeePayrollService(req.params.userId));
  } catch (err) { next(err); }
});

// GET single payroll record
router.get("/:recordId", async (req, res, next) => {
  try {
    res.json(await getPayrollRecordService(req.params.recordId));
  } catch (err) { next(err); }
});

// POST calculate payroll (preview)
router.post("/calculate", async (req, res, next) => {
  try {
    const { userId, periodStart, periodEnd } = z.object({
      userId: z.string().uuid(),
      periodStart: z.string().datetime(),
      periodEnd: z.string().datetime(),
    }).parse(req.body);
    const result = await calculatePayrollService(userId, {
      start: new Date(periodStart), end: new Date(periodEnd),
    });
    res.json(result);
  } catch (err) { next(err); }
});

// POST generate payroll record
router.post("/generate", async (req, res, next) => {
  try {
    const { userId, periodStart, periodEnd } = z.object({
      userId: z.string().uuid(),
      periodStart: z.string().datetime(),
      periodEnd: z.string().datetime(),
    }).parse(req.body);
    const record = await generatePayrollRecordService(userId, {
      start: new Date(periodStart), end: new Date(periodEnd),
    });
    res.status(201).json(record);
  } catch (err) { next(err); }
});

// POST approve
router.post("/:recordId/approve", async (req, res, next) => {
  try {
    res.json(await approvePayrollService(req.params.recordId, req.user!.userId));
  } catch (err) { next(err); }
});

// POST pay
router.post("/:recordId/pay", async (req, res, next) => {
  try {
    res.json(await payPayrollService(req.params.recordId, req.user!.userId));
  } catch (err) { next(err); }
});

// POST lock
router.post("/:recordId/lock", async (req, res, next) => {
  try {
    res.json(await lockPayrollService(req.params.recordId, req.user!.userId));
  } catch (err) { next(err); }
});

export default router;
