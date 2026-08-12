const { Router } = require('express');
const { db } = require('../../config/db-client');
const router = Router();

router.get('/', async (req, res, next) => {
  try { const { status, companyId } = req.query; const where = { companyId: companyId || 'seed-company-001' }; if (status) where.status = status; const rows = await db.task.findMany({ where, orderBy: 'createdAt' }); res.json({ items: rows, total: rows.length }); } catch (err) { next(err); }
});
router.post('/', async (req, res, next) => {
  try { const { companyId = 'seed-company-001', title, description, status = 'todo', priority = 'medium', assigneeId, branchId } = req.body; if (!title) return res.status(400).json({ error: 'title required' }); res.status(201).json(await db.task.create({ companyId, title, description, status, priority, assigneeId, branchId })); } catch (err) { next(err); }
});
router.patch('/:id', async (req, res, next) => {
  try { const { status, title, priority, assigneeId } = req.body; const data = {}; if (status) data.status = status; if (title) data.title = title; if (priority) data.priority = priority; if (assigneeId) data.assigneeId = assigneeId; res.json(await db.task.update(req.params.id, data)); } catch (err) { next(err); }
});
router.delete('/:id', async (req, res, next) => {
  try { await db.task.remove(req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});
module.exports = router;
