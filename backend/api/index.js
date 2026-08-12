// Vercel serverless Express entrypoint — uses HTTP db proxy for Supabase
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const helmetMiddleware = helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false });
const apiRateLimiter = rateLimit({ windowMs: 60000, max: 100, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests' } });

const app = express();
app.set('trust proxy', 1);
app.use(helmetMiddleware);
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(apiRateLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV, proxy: process.env.DB_PROXY_URL ? 'configured' : 'missing' }));

// Load TSX for remaining TS modules
require('tsx/cjs');

// Auth uses JS version (HTTP proxy) — no Prisma direct connection needed
app.use('/api/v1/auth', require('../src/modules/auth/auth.routes').default);

// Other routes (may still need DB_PROXY_URL set or will use Prisma if available)
try { app.use('/api/v1/products', require('../src/modules/products/products.routes').default); } catch(e) {}
try { app.use('/api/v1/orders', require('../src/modules/orders/orders.routes').default); } catch(e) {}
try { app.use('/api/v1/customers', require('../src/modules/customers/customers.routes').default); } catch(e) {}
try { app.use('/api/v1/branches', require('../src/modules/branches/branches.routes').default); } catch(e) {}
try { app.use('/api/v1/settings', require('../src/modules/settings/settings.routes').default); } catch(e) {}
try { app.use('/api/v1/dashboard', require('../src/modules/dashboard/dashboard.routes').default); } catch(e) {}
try { app.use('/api/v1/reports', require('../src/modules/reports/reports.routes').default); } catch(e) {}
try { app.use('/api/v1/cash-register', require('../src/modules/cashRegister/cashRegister.routes').default); } catch(e) {}
try { app.use('/api/v1/hr', require('../src/modules/hr/hr.routes').default); } catch(e) {}
try { app.use('/api/v1/payroll', require('../src/modules/payroll/payroll.routes').default); } catch(e) {}
try { app.use('/api/v1/inventory', require('../src/modules/inventory/inventory.routes').default); } catch(e) {}

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  const msg = err.message || 'Internal server error';
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, error: { code: err.code || 'INTERNAL_ERROR', message: msg } });
});

module.exports = app;
