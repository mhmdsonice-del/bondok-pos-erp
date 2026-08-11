import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireBranchAccess, resolveBranch, getEffectiveBranchId } from "../../middleware/auth";
import {
  createOrderService,
  completeOrderService,
  cancelOrderService,
  refundOrderService,
  splitOrderService,
  mergeOrdersService,
  holdOrderService,
  resumeOrderService,
  getOrderByIdService,
} from "./orders.service";

const router = Router();
router.use(requireAuth);
router.use(resolveBranch);

// ---- Schemas ----

const createOrderSchema = z.object({
  branchId: z.string().uuid(),
  type: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY", "PICKUP"]),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
    discount: z.number().optional(),
    notes: z.string().optional(),
    variantId: z.string().uuid().optional(),
    selectedModifiers: z.array(z.object({
      modifierId: z.string().uuid(), name: z.string(), price: z.number()
    })).optional(),
  })),
  couponCode: z.string().optional(),
  customerId: z.string().uuid().optional(),
  taxRatePercent: z.number().optional(),
  serviceChargePercent: z.number().optional(),
  clientTransactionId: z.string().optional(),
});

const completeSchema = z.object({
  payments: z.array(z.object({
    method: z.enum(["CASH", "VISA", "WALLET", "MIXED", "OTHER"]),
    amount: z.number().positive(),
  })),
});

const cancelSchema = z.object({
  reason: z.string().min(1),
});

const refundSchema = z.object({
  type: z.enum(["FULL", "PARTIAL"]),
  amount: z.number().positive().optional(),
  items: z.array(z.object({
    orderItemId: z.string().uuid(),
    quantity: z.number().positive(),
  })).optional(),
  reason: z.string().min(1),
});

const splitSchema = z.object({
  itemIds: z.array(z.string().uuid()).min(1),
});

const mergeSchema = z.object({
  orderIds: z.array(z.string().uuid()).min(2).max(10),
});

// ---- Routes ----

// GET order by id
router.get("/:id", async (req, res, next) => {
  try {
    const order = await getOrderByIdService(req.params.id, req.user!.companyId);
    res.json(order);
  } catch (err) { next(err); }
});

// POST create order
router.post("/", requireBranchAccess, async (req, res, next) => {
  try {
    const input = createOrderSchema.parse(req.body);
    const order = await createOrderService({
      ...input, createdById: req.user!.userId, companyId: req.user!.companyId,
    } as any);
    res.status(201).json(order);
  } catch (err) { next(err); }
});

// POST hold order
router.post("/:id/hold", async (req, res, next) => {
  try {
    const order = await holdOrderService(req.params.id, req.user!.userId, req.user!.companyId);
    res.json(order);
  } catch (err) { next(err); }
});

// POST resume order
router.post("/:id/resume", async (req, res, next) => {
  try {
    const order = await resumeOrderService(req.params.id, req.user!.userId, req.user!.companyId);
    res.json(order);
  } catch (err) { next(err); }
});

// POST complete order (REAL atomic transaction)
router.post("/:id/complete", async (req, res, next) => {
  try {
    const { payments } = completeSchema.parse(req.body);
    const order = await completeOrderService(
      req.params.id, payments as any, req.user!.userId, req.user!.companyId
    );
    res.json(order);
  } catch (err) { next(err); }
});

// POST cancel order (REAL)
router.post("/:id/cancel", async (req, res, next) => {
  try {
    const { reason } = cancelSchema.parse(req.body);
    const order = await cancelOrderService(
      req.params.id, reason, req.user!.userId, req.user!.companyId
    );
    res.json(order);
  } catch (err) { next(err); }
});

// POST refund order (REAL)
router.post("/:id/refund", async (req, res, next) => {
  try {
    const input = refundSchema.parse(req.body);
    const refund = await refundOrderService(
      req.params.id, input as any, req.user!.userId, req.user!.companyId
    );
    res.status(201).json(refund);
  } catch (err) { next(err); }
});

// POST split order (REAL)
router.post("/:id/split", async (req, res, next) => {
  try {
    const { itemIds } = splitSchema.parse(req.body);
    const result = await splitOrderService(
      req.params.id, itemIds as any, req.user!.userId, req.user!.companyId
    );
    res.status(201).json(result);
  } catch (err) { next(err); }
});

// POST merge orders (REAL)
router.post("/merge", async (req, res, next) => {
  try {
    const { orderIds } = mergeSchema.parse(req.body);
    const result = await mergeOrdersService(
      orderIds as any, req.user!.userId, req.user!.companyId
    );
    res.status(201).json(result);
  } catch (err) { next(err); }
});

export default router;
