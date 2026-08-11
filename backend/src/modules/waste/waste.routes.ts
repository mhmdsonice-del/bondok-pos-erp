import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { createWasteEntryService, listWasteEntriesService, wasteSummaryService } from "./waste.service";

const router = Router();
router.use(requireAuth);

router.post("/", requireRole("SUPER_ADMIN","ADMIN","BRANCH_MANAGER","INVENTORY_CLERK"), async (req, res, next) => { try { res.status(201).json(await createWasteEntryService(req.body)); } catch (err) { next(err); } });
router.get("/", async (req, res, next) => { try { const { branchId, start, end } = req.query; res.json(await listWasteEntriesService(branchId as string, start ? new Date(start as string) : undefined, end ? new Date(end as string) : undefined)); } catch (err) { next(err); } });
router.get("/summary", async (req, res, next) => { try { const { branchId, start, end } = req.query; res.json(await wasteSummaryService(branchId as string, new Date(start as string), new Date(end as string))); } catch (err) { next(err); } });

export default router;