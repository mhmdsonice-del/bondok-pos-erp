const { Router } = require('express');
const { db } = require('../../config/db-client');
const router = Router();

router.get('/', async (req, res, next) => {
  try { const { companyId = 'seed-company-001', status } = req.query; const where = { companyId }; if (status) where.status = status; const rows = await db.asset.findMany({ where, orderBy: 'createdAt' }); res.json({ items: rows, total: rows.length }); } catch (err) { next(err); }
});
router.post('/', async (req, res, next) => {
  try { const { companyId = 'seed-company-001', branchId, name, type, serialNumber, lastMaintenance, nextMaintenance, status = 'ok', notes } = req.body; if (!name) return res.status(400).json({ error: 'name required' }); res.status(201).json(await db.asset.create({ companyId, branchId, name, type, serialNumber, lastMaintenance, nextMaintenance, status, notes })); } catch (err) { next(err); }
});
router.patch('/:id', async (req, res, next) => {
  try { const { status, lastMaintenance, nextMaintenance, notes } = req.body; const data = {}; if (status) data.status = status; if (lastMaintenance) data.lastMaintenance = lastMaintenance; if (nextMaintenance) data.nextMaintenance = nextMaintenance; if (notes !== undefined) data.notes = notes; res.json(await db.asset.update(req.params.id, data)); } catch (err) { next(err); }
});
router.delete('/:id', async (req, res, next) => {
  try { await db.asset.remove(req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});
module.exports = router;
