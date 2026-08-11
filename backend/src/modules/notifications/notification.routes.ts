import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { getUserNotificationsService, markReadService, markAllReadService } from "./notification.service";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => { try { res.json(await getUserNotificationsService(req.user!.userId, req.query.unread === "true")); } catch (err) { next(err); } });
router.post("/:id/read", async (req, res, next) => { try { res.json(await markReadService(req.params.id)); } catch (err) { next(err); } });
router.post("/read-all", async (req, res, next) => { try { res.json(await markAllReadService(req.user!.userId)); } catch (err) { next(err); } });

export default router;