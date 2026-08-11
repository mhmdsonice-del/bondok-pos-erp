import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../../middleware/auth";
import { createCustomerService, updateCustomerService, getCustomerProfileService, searchCustomersService, listCustomersService, addLoyaltyPointsService, redeemLoyaltyPointsService, chargeCustomerBalanceService, createCouponService } from "./customers.service";

const router = Router();
router.use(requireAuth);

router.post("/", requireRole("SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"), async (req, res, next) => {
  try { res.status(201).json(await createCustomerService({ ...req.body, companyId: req.user!.companyId })); } catch (err) { next(err); }
});

router.patch("/:id", requireRole("SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"), async (req, res, next) => {
  try { res.json(await updateCustomerService(req.params.id, req.user!.companyId, req.body)); } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try { res.json(await getCustomerProfileService(req.params.id, req.user!.companyId)); } catch (err) { next(err); }
});

router.get("/", async (req, res, next) => {
  try { const query = req.query.q as string; res.json(query ? await searchCustomersService(req.user!.companyId, query) : await listCustomersService(req.user!.companyId)); } catch (err) { next(err); }
});

router.post("/:id/loyalty/add", async (req, res, next) => {
  try { const { orderTotal, ratio } = z.object({ orderTotal: z.number(), ratio: z.number().optional() }).parse(req.body); res.json(await addLoyaltyPointsService(req.params.id, req.user!.companyId, orderTotal, ratio)); } catch (err) { next(err); }
});

router.post("/:id/loyalty/redeem", async (req, res, next) => {
  try { const { points } = z.object({ points: z.number().positive() }).parse(req.body); res.json(await redeemLoyaltyPointsService(req.params.id, req.user!.companyId, points)); } catch (err) { next(err); }
});

router.post("/:id/charge", async (req, res, next) => {
  try { const { amount } = z.object({ amount: z.number() }).parse(req.body); res.json(await chargeCustomerBalanceService(req.params.id, req.user!.companyId, amount)); } catch (err) { next(err); }
});

router.post("/coupons", requireRole("SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"), async (req, res, next) => {
  try { res.status(201).json(await createCouponService(req.body)); } catch (err) { next(err); }
});

export default router;