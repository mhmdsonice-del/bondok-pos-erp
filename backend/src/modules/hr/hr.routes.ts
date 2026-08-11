import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { requestLeaveService, approveLeaveService, rejectLeaveService, getEmployeeLeavesService, getLeaveBalanceService, createAdvanceService, deductAdvanceService, getEmployeeAdvancesService, createPenaltyService, markPenaltyDeductedService, getEmployeePenaltiesService, createRewardService, markRewardPaidService, getEmployeeRewardsService, createShiftService, assignShiftService, getBranchShiftsService } from "./hr.service";

const router = Router();
router.use(requireAuth);

router.post("/leaves", async (req, res, next) => { try { res.status(201).json(await requestLeaveService({ ...req.body, userId: req.user!.userId })); } catch (err) { next(err); } });
router.post("/leaves/:id/approve", requireRole("SUPER_ADMIN","ADMIN","BRANCH_MANAGER","HR_MANAGER"), async (req, res, next) => { try { res.json(await approveLeaveService(req.params.id, req.user!.userId)); } catch (err) { next(err); } });
router.post("/leaves/:id/reject", requireRole("SUPER_ADMIN","ADMIN","BRANCH_MANAGER","HR_MANAGER"), async (req, res, next) => { try { res.json(await rejectLeaveService(req.params.id, req.user!.userId)); } catch (err) { next(err); } });
router.get("/leaves/:userId", async (req, res, next) => { try { res.json(await getEmployeeLeavesService(req.params.userId)); } catch (err) { next(err); } });
router.get("/leaves/:userId/balance", async (req, res, next) => { try { res.json(await getLeaveBalanceService(req.params.userId)); } catch (err) { next(err); } });

router.post("/advances", requireRole("SUPER_ADMIN","ADMIN","HR_MANAGER"), async (req, res, next) => { try { res.status(201).json(await createAdvanceService(req.body)); } catch (err) { next(err); } });
router.post("/advances/:id/deduct", requireRole("SUPER_ADMIN","ADMIN","HR_MANAGER"), async (req, res, next) => { try { res.json(await deductAdvanceService(req.params.id, req.body.amount)); } catch (err) { next(err); } });
router.get("/advances/:userId", async (req, res, next) => { try { res.json(await getEmployeeAdvancesService(req.params.userId)); } catch (err) { next(err); } });

router.post("/penalties", requireRole("SUPER_ADMIN","ADMIN","BRANCH_MANAGER","HR_MANAGER"), async (req, res, next) => { try { res.status(201).json(await createPenaltyService(req.body)); } catch (err) { next(err); } });
router.post("/penalties/:id/deduct", requireRole("SUPER_ADMIN","ADMIN","HR_MANAGER"), async (req, res, next) => { try { res.json(await markPenaltyDeductedService(req.params.id)); } catch (err) { next(err); } });
router.get("/penalties/:userId", async (req, res, next) => { try { res.json(await getEmployeePenaltiesService(req.params.userId)); } catch (err) { next(err); } });

router.post("/rewards", requireRole("SUPER_ADMIN","ADMIN","BRANCH_MANAGER","HR_MANAGER"), async (req, res, next) => { try { res.status(201).json(await createRewardService(req.body)); } catch (err) { next(err); } });
router.post("/rewards/:id/pay", requireRole("SUPER_ADMIN","ADMIN","HR_MANAGER"), async (req, res, next) => { try { res.json(await markRewardPaidService(req.params.id)); } catch (err) { next(err); } });
router.get("/rewards/:userId", async (req, res, next) => { try { res.json(await getEmployeeRewardsService(req.params.userId)); } catch (err) { next(err); } });

router.post("/shifts", requireRole("SUPER_ADMIN","ADMIN","BRANCH_MANAGER"), async (req, res, next) => { try { res.status(201).json(await createShiftService(req.body)); } catch (err) { next(err); } });
router.post("/shifts/assign", requireRole("SUPER_ADMIN","ADMIN","BRANCH_MANAGER"), async (req, res, next) => { try { res.status(201).json(await assignShiftService(req.body)); } catch (err) { next(err); } });
router.get("/shifts/:branchId", async (req, res, next) => { try { res.json(await getBranchShiftsService(req.params.branchId)); } catch (err) { next(err); } });

export default router;