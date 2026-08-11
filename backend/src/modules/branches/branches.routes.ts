import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../../middleware/auth";
import { createBranchService, listBranchesService, transferProductBetweenBranchesService, consolidatedBranchReportService } from "./branches.service";

const router = Router();
router.use(requireAuth);

router.post("/", requireRole("SUPER_ADMIN", "ADMIN"), async (req, res, next) => {
  try { const input = z.object({ name: z.string().min(1), address: z.string().optional(), phone: z.string().optional() }).parse(req.body); res.status(201).json(await createBranchService({ ...(input as any), companyId: req.user!.companyId })); } catch (err) { next(err); }
});

router.get("/", async (req, res, next) => { try { res.json(await listBranchesService(req.user!.companyId)); } catch (err) { next(err); } });

const transferSchema = z.object({ fromBranchId: z.string().uuid(), toBranchId: z.string().uuid(), productId: z.string().uuid(), quantity: z.number().positive() });

router.post("/transfer-product", requireRole("SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"), async (req, res, next) => {
  try { res.json(await transferProductBetweenBranchesService(transferSchema.parse(req.body) as any)); } catch (err) { next(err); }
});

router.get("/reports/consolidated", requireRole("SUPER_ADMIN", "ADMIN"), async (req, res, next) => {
  try { res.json(await consolidatedBranchReportService(req.user!.companyId)); } catch (err) { next(err); }
});

export default router;