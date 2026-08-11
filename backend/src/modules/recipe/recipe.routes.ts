import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../../middleware/auth";
import { createRecipeService, getRecipeService, calculateFoodCostService, explodeRecipeService } from "./recipe.service";

const router = Router();
router.use(requireAuth);

const recipeItemSchema = z.object({ rawMaterialId: z.string().uuid(), quantity: z.number().positive(), unitName: z.string().optional() });

router.post("/:productId", requireRole("SUPER_ADMIN","ADMIN","BRANCH_MANAGER","INVENTORY_CLERK"), async (req, res, next) => { try { const { items } = z.object({ items: z.array(recipeItemSchema).min(1) }).parse(req.body); res.status(201).json(await createRecipeService({ productId: req.params.productId, items: items as any })); } catch (err) { next(err); } });
router.get("/:productId", async (req, res, next) => { try { res.json(await getRecipeService(req.params.productId)); } catch (err) { next(err); } });
router.get("/:productId/food-cost", async (req, res, next) => { try { res.json(await calculateFoodCostService(req.params.productId)); } catch (err) { next(err); } });
router.post("/:productId/explode", requireRole("SUPER_ADMIN","ADMIN"), async (req, res, next) => { try { const { warehouseId, quantity, orderReference } = z.object({ warehouseId: z.string().uuid(), quantity: z.number().positive(), orderReference: z.string() }).parse(req.body); await explodeRecipeService(req.params.productId, quantity, warehouseId, orderReference); res.json({ success: true }); } catch (err) { next(err); } });

export default router;