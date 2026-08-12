// Vercel serverless Express entrypoint — self-contained (no TS imports)
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

// V8 modules — pure JS (HTTP db-proxy), no Prisma/TSX
app.use('/api/v1/auth', require('../src/modules/auth/auth.routes.js'));
app.use('/api/v1/tasks', require('../src/modules/tasks/tasks.routes.js'));
app.use('/api/v1/haccp', require('../src/modules/haccp/haccp.routes.js'));
app.use('/api/v1/assets', require('../src/modules/assets/assets.routes.js'));

// Legacy TSX modules (Prisma-based — blocked by IPv6 but kept for local/dev)
require('tsx/cjs');
try { app.use('/api/v1/orders', require('../src/modules/orders/orders.routes').default); } catch(e) {}
try { app.use('/api/v1/products', require('../src/modules/products/products.routes').default); } catch(e) {}
try { app.use('/api/v1/customers', require('../src/modules/customers/customers.routes').default); } catch(e) {}
try { app.use('/api/v1/suppliers', require('../src/modules/suppliers/suppliers.routes').default); } catch(e) {}
try { app.use('/api/v1/employees', require('../src/modules/employees/employees.routes').default); } catch(e) {}
try { app.use('/api/v1/branches', require('../src/modules/branches/branches.routes').default); } catch(e) {}
try { app.use('/api/v1/settings', require('../src/modules/settings/settings.routes').default); } catch(e) {}
try { app.use('/api/v1/reports', require('../src/modules/reports/reports.routes').default); } catch(e) {}
try { app.use('/api/v1/dashboard', require('../src/modules/dashboard/dashboard.routes').default); } catch(e) {}

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  const status = err.statusCode || 500;
  console.error('Error:', err.message);
  res.status(status).json({ success: false, error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Internal server error' } });
});

module.exports = app;
