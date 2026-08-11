import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../../middleware/auth";
import { createTaxService, listTaxesService, updateCompanySettingsService, exportBackupService } from "./settings.service";

const router = Router();
router.use(requireAuth, requireRole("SUPER_ADMIN", "ADMIN"));

router.post("/taxes", async (req, res, next) => {
  try { const input = z.object({ name: z.string().min(1), rate: z.number().min(0).max(100) }).parse(req.body); res.status(201).json(await createTaxService({ ...(input as any), companyId: req.user!.companyId })); } catch (err) { next(err); }
});

router.get("/taxes", async (req, res, next) => { try { res.json(await listTaxesService(req.user!.companyId)); } catch (err) { next(err); } });

const companySchema = z.object({ name: z.string().optional(), logoUrl: z.string().url().optional(), taxNumber: z.string().optional(), currency: z.string().optional(), language: z.string().optional() });

router.patch("/company", async (req, res, next) => {
  try { res.json(await updateCompanySettingsService(req.user!.companyId, companySchema.parse(req.body))); } catch (err) { next(err); }
});

router.get("/backup/export", async (req, res, next) => {
  try { res.json(await exportBackupService(req.user!.companyId)); } catch (err) { next(err); }
});

export default router;