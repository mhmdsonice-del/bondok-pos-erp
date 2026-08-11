import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { createExpenseService, listExpensesService, createExpenseCategoryService, listExpenseCategoriesService, expensesSummaryService } from "./expense.service";

const router = Router();
router.use(requireAuth);

router.post("/", requireRole("SUPER_ADMIN","ADMIN","BRANCH_MANAGER"), async (req, res, next) => { try { res.status(201).json(await createExpenseService(req.body)); } catch (err) { next(err); } });
router.get("/", async (req, res, next) => { try { const { branchId, start, end } = req.query; res.json(await listExpensesService((branchId || req.activeBranchId) as string, start ? new Date(start as string) : undefined, end ? new Date(end as string) : undefined)); } catch (err) { next(err); } });
router.get("/summary", async (req, res, next) => { try { const { branchId, start, end } = req.query; res.json(await expensesSummaryService((branchId || req.activeBranchId) as string, new Date(start as string), new Date(end as string))); } catch (err) { next(err); } });
router.post("/categories", requireRole("SUPER_ADMIN","ADMIN"), async (req, res, next) => { try { res.status(201).json(await createExpenseCategoryService({ ...req.body, companyId: req.user!.companyId })); } catch (err) { next(err); } });
router.get("/categories", async (req, res, next) => { try { res.json(await listExpenseCategoriesService(req.user!.companyId)); } catch (err) { next(err); } });

export default router;