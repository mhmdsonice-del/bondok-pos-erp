import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { dashboardSummaryService, dailySalesService, topProductsService, smartAlertsService } from "./dashboard.service";

const router = Router();
router.use(requireAuth);

const rangeSchema = z.object({ branchId: z.string().uuid(), start: z.coerce.date(), end: z.coerce.date() });

router.get("/summary", async (req, res, next) => { try { const { branchId, start, end } = rangeSchema.parse(req.query); res.json(await dashboardSummaryService(branchId, { start, end })); } catch (err) { next(err); } });

router.get("/top-products", async (req, res, next) => { try { const { branchId, start, end } = rangeSchema.parse(req.query); res.json(await topProductsService(branchId, { start, end })); } catch (err) { next(err); } });

router.get("/daily-sales", async (req, res, next) => { try { const { branchId } = z.object({ branchId: z.string().uuid() }).parse(req.query); res.json(await dailySalesService(branchId)); } catch (err) { next(err); } });

router.get("/alerts", async (req, res, next) => { try { const { branchId } = z.object({ branchId: z.string().uuid() }).parse(req.query); res.json(await smartAlertsService(branchId)); } catch (err) { next(err); } });

export default router;