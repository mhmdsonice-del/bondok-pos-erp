import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { createProductService, updateProductService, deactivateProductService, listProductsService, getProductByBarcodeService } from "./products.service";

const router = Router();
router.use(requireAuth);

router.post("/", requireRole("SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"), async (req, res, next) => {
  try { res.status(201).json(await createProductService({ ...req.body, companyId: req.user!.companyId })); } catch (err) { next(err); }
});

router.patch("/:id", requireRole("SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"), async (req, res, next) => {
  try { res.json(await updateProductService(req.params.id, req.user!.companyId, req.body)); } catch (err) { next(err); }
});

router.delete("/:id", requireRole("SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"), async (req, res, next) => {
  try { res.json(await deactivateProductService(req.params.id, req.user!.companyId)); } catch (err) { next(err); }
});

router.get("/", async (req, res, next) => {
  try { const { categoryId, search, page, pageSize } = req.query; res.json(await listProductsService({ companyId: req.user!.companyId, categoryId: categoryId as string, search: search as string, page: page ? Number(page) : undefined, pageSize: pageSize ? Number(pageSize) : undefined })); } catch (err) { next(err); }
});

router.get("/barcode/:barcode", async (req, res, next) => {
  try { res.json(await getProductByBarcodeService(req.user!.companyId, req.params.barcode)); } catch (err) { next(err); }
});

export default router;