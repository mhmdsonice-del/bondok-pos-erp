import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../../middleware/auth";
import { createSupplierService, listSuppliersService, createPurchaseService, paySupplierService, supplierStatementService } from "./suppliers.service";

const router = Router();
router.use(requireAuth);

router.post("/", requireRole("SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"), async (req, res, next) => {
  try { const { name, phone } = z.object({ name: z.string().min(1), phone: z.string().optional() }).parse(req.body); res.status(201).json(await createSupplierService({ name, phone, companyId: req.user!.companyId })); } catch (err) { next(err); }
});

router.get("/", async (req, res, next) => { try { res.json(await listSuppliersService(req.user!.companyId)); } catch (err) { next(err); } });

router.post("/purchases", requireRole("SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"), async (req, res, next) => {
  try { res.status(201).json(await createPurchaseService({ ...req.body, companyId: req.user!.companyId })); } catch (err) { next(err); }
});

router.post("/purchases/:id/pay", requireRole("SUPER_ADMIN", "ADMIN", "ACCOUNTANT"), async (req, res, next) => {
  try { const { amount, method } = z.object({ amount: z.number().positive(), method: z.enum(["CASH","VISA","WALLET","MIXED"]) }).parse(req.body); res.json(await paySupplierService(req.params.id, req.user!.companyId, amount, method)); } catch (err) { next(err); }
});

router.get("/:id/statement", async (req, res, next) => { try { res.json(await supplierStatementService(req.params.id, req.user!.companyId)); } catch (err) { next(err); } });

export default router;