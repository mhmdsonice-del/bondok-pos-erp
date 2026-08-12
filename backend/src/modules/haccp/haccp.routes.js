const { Router } = require('express');
const { db } = require('../../config/db-client');
const router = Router();

router.get('/', async (req, res, next) => {
  try { const { companyId = 'seed-company-001', status } = req.query; const where = { companyId }; if (status) where.status = status; const rows = await db.haccpCheck.findMany({ where, orderBy: 'checkedAt' }); res.json({ items: rows, total: rows.length }); } catch (err) { next(err); }
});
router.post('/', async (req, res, next) => {
  try { const { companyId = 'seed-company-001', branchId, checkPoint, targetValue, actualValue, frequency, status = 'pass', checkedById, notes } = req.body; if (!checkPoint) return res.status(400).json({ error: 'checkPoint required' }); res.status(201).json(await db.haccpCheck.create({ companyId, branchId, checkPoint, targetValue, actualValue, frequency, status, checkedById, notes })); } catch (err) { next(err); }
});
router.patch('/:id', async (req, res, next) => {
  try { const { status, actualValue, notes } = req.body; const data = {}; if (status) data.status = status; if (actualValue !== undefined) data.actualValue = actualValue; if (notes !== undefined) data.notes = notes; res.json(await db.haccpCheck.update(req.params.id, data)); } catch (err) { next(err); }
});
router.delete('/:id', async (req, res, next) => {
  try { await db.haccpCheck.remove(req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});
module.exports = router;
