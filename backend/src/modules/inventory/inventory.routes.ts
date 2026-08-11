import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../../middleware/auth";
import {
  adjustStockService, getStockLevelService, recordStockMovementService,
  transferStockService, lowStockAlertsService, expiringStockService,
} from "./inventory.service";

const router = Router();
router.use(requireAuth);

router.get("/:warehouseId", async (req, res, next) => {
  try {
    const { productId } = req.query;
    const result = await getStockLevelService(
      req.params.warehouseId, req.user!.companyId, productId as string
    );
    res.json(result);
  } catch (err) { next(err); }
});

router.post("/adjust", requireRole("SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER", "INVENTORY_CLERK"), async (req, res, next) => {
  try {
    const input = z.object({
      warehouseId: z.string().uuid(), productId: z.string().uuid(),
      delta: z.number(), batchNumber: z.string().optional(),
    }).parse(req.body);
    const result = await adjustStockService(
      input.warehouseId, input.productId, input.delta,
      req.user!.companyId, input.batchNumber
    );
    res.json(result);
  } catch (err) { next(err); }
});

const movementSchema = z.object({
  warehouseId: z.string().uuid(), productId: z.string().uuid(),
  type: z.enum(["PURCHASE_IN", "TRANSFER_IN", "TRANSFER_OUT", "ADJUSTMENT_IN",
    "ADJUSTMENT_OUT", "WASTE", "RETURN_IN", "RETURN_OUT", "SALE_OUT",
    "STOCKTAKE_CORRECTION", "RECIPE_CONSUMPTION"]),
  quantity: z.number().positive(),
  batchNumber: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  unitCost: z.number().optional(),
});

router.post("/movements", requireRole("SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER", "INVENTORY_CLERK"), async (req, res, next) => {
  try {
    const input = movementSchema.parse(req.body);
    const result = await recordStockMovementService(input as any, req.user!.companyId);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

const transferSchema = z.object({
  fromWarehouseId: z.string().uuid(), toWarehouseId: z.string().uuid(),
  productId: z.string().uuid(), quantity: z.number().positive(),
  batchNumber: z.string().optional(),
});

router.post("/transfer", requireRole("SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER", "INVENTORY_CLERK"), async (req, res, next) => {
  try {
    const input = transferSchema.parse(req.body);
    const result = await transferStockService(input as any, req.user!.companyId);
    res.json(result);
  } catch (err) { next(err); }
});

router.get("/alerts/low-stock", async (req, res, next) => {
  try {
    const { warehouseId } = z.object({ warehouseId: z.string().uuid() }).parse(req.query);
    res.json(await lowStockAlertsService(warehouseId, req.user!.companyId));
  } catch (err) { next(err); }
});

router.get("/alerts/expiring", async (req, res, next) => {
  try {
    const { warehouseId, days } = z.object({
      warehouseId: z.string().uuid(),
      days: z.coerce.number().optional(),
    }).parse(req.query);
    res.json(await expiringStockService(warehouseId, req.user!.companyId, days));
  } catch (err) { next(err); }
});

export default router;
