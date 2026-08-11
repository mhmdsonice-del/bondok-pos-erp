import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../../middleware/auth";
import { openCashRegisterService, getCurrentRegisterService, recordCashMovementService, closeCashRegisterService, monthlyClosingReportService } from "./cashRegister.service";

const router = Router();
router.use(requireAuth, requireRole("SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER", "CASHIER", "ACCOUNTANT"));

router.get("/current", async (req, res, next) => {
  try { const { branchId } = z.object({ branchId: z.string().uuid() }).parse(req.query); res.json(await getCurrentRegisterService(branchId)); } catch (err) { next(err); }
});

router.post("/open", async (req, res, next) => {
  try { const { branchId, openingAmount } = z.object({ branchId: z.string().uuid(), openingAmount: z.number().nonnegative() }).parse(req.body) as { branchId: string; openingAmount: number }; res.status(201).json(await openCashRegisterService(branchId, req.user!.userId, openingAmount)); } catch (err) { next(err); }
});

const movementSchema = z.object({ cashRegisterId: z.string().uuid(), type: z.enum(["RECEIPT","PAYMENT","TRANSFER","ADJUSTMENT","OPENING","CLOSING","REFUND"]), amount: z.number().positive(), notes: z.string().optional() });

router.post("/movements", async (req, res, next) => {
  try { const input = movementSchema.parse(req.body) as any; res.status(201).json(await recordCashMovementService({ ...input, userId: req.user!.userId })); } catch (err) { next(err); }
});

router.post("/:id/close", async (req, res, next) => {
  try { const { actualClosingAmount, closingReason } = z.object({ actualClosingAmount: z.number().nonnegative(), closingReason: z.string().optional() }).parse(req.body); res.json(await closeCashRegisterService(req.params.id, req.user!.userId, actualClosingAmount, closingReason)); } catch (err) { next(err); }
});

router.get("/reports/monthly", requireRole("SUPER_ADMIN", "ADMIN", "ACCOUNTANT"), async (req, res, next) => {
  try { const { branchId, year, month } = z.object({ branchId: z.string().uuid(), year: z.coerce.number(), month: z.coerce.number().min(1).max(12) }).parse(req.query); res.json(await monthlyClosingReportService(branchId, year, month)); } catch (err) { next(err); }
});

export default router;