import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { salesReportRows, productsReportRows, profitReportRows, employeesReportRows, customersReportRows, suppliersReportRows, taxReportRows, cashReportRows, exportCsvReportService } from "./reports.service";

const router = Router();
router.use(requireAuth);
const rangeSchema = z.object({ branchId: z.string().uuid(), start: z.coerce.date(), end: z.coerce.date() });

router.get("/sales", async (req, res, next) => { try { const { branchId, start, end } = rangeSchema.parse(req.query); res.json(await salesReportRows(branchId, { start, end })); } catch (err) { next(err); } });
router.get("/products", async (req, res, next) => { try { const { branchId, start, end } = rangeSchema.parse(req.query); res.json(await productsReportRows(branchId, { start, end })); } catch (err) { next(err); } });
router.get("/profit", async (req, res, next) => { try { const { branchId, start, end } = rangeSchema.parse(req.query); res.json(await profitReportRows(branchId, { start, end })); } catch (err) { next(err); } });
router.get("/employees", async (req, res, next) => { try { const { branchId, start, end } = rangeSchema.parse(req.query); res.json(await employeesReportRows(branchId, { start, end })); } catch (err) { next(err); } });
router.get("/customers", async (req, res, next) => { try { const { branchId, start, end } = rangeSchema.parse(req.query); res.json(await customersReportRows(branchId, { start, end })); } catch (err) { next(err); } });
router.get("/suppliers", async (req, res, next) => { try { res.json(await suppliersReportRows(req.user!.companyId)); } catch (err) { next(err); } });
router.get("/tax", async (req, res, next) => { try { const { branchId, start, end } = rangeSchema.parse(req.query); res.json(await taxReportRows(branchId, { start, end })); } catch (err) { next(err); } });
router.get("/cash", async (req, res, next) => { try { const { branchId, start, end } = rangeSchema.parse(req.query); res.json(await cashReportRows(branchId, { start, end })); } catch (err) { next(err); } });
router.get("/export/csv", async (req, res, next) => { try { res.json(await exportCsvReportService()); } catch (err) { next(err); } });

export default router;