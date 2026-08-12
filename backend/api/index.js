// Vercel serverless Express entrypoint
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const h = helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false });
const r = rateLimit({ windowMs: 60000, max: 100, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests' } });

const app = express();
app.set('trust proxy', 1);
app.use(h);
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(r);

app.get('/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV, proxy: process.env.DB_PROXY_URL ? 'configured' : 'missing' }));

// Auth — uses pure JS module (no Prisma, no TSX)
app.use('/api/v1/auth', require('../src/modules/auth/auth.routes.js'));

// Load TSX for remaining TS routes
require('tsx/cjs');

const tsRoutes = [
  ['/api/v1/products', '../src/modules/products/products.routes'],
  ['/api/v1/orders', '../src/modules/orders/orders.routes'],
  ['/api/v1/customers', '../src/modules/customers/customers.routes'],
  ['/api/v1/branches', '../src/modules/branches/branches.routes'],
  ['/api/v1/settings', '../src/modules/settings/settings.routes'],
  ['/api/v1/dashboard', '../src/modules/dashboard/dashboard.routes'],
  ['/api/v1/reports', '../src/modules/reports/reports.routes'],
  ['/api/v1/cash-register', '../src/modules/cashRegister/cashRegister.routes'],
  ['/api/v1/hr', '../src/modules/hr/hr.routes'],
  ['/api/v1/payroll', '../src/modules/payroll/payroll.routes'],
  ['/api/v1/inventory', '../src/modules/inventory/inventory.routes'],
];
tsRoutes.forEach(([path, mod]) => { try { app.use(path, require(mod).default); } catch(e) { /* skip */ } });

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  const msg = err.message || 'Internal server error';
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, error: { code: err.code || 'INTERNAL_ERROR', message: msg } });
});

module.exports = app;
