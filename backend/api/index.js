// Vercel serverless Express entrypoint
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const helmetMiddleware = helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false });
const apiRateLimiter = rateLimit({ windowMs: 60000, max: 100, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests, please try again later.' } });

const app = express();
app.set('trust proxy', 1);
app.use(helmetMiddleware);
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(apiRateLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// Load tsx for TypeScript modules
require('tsx/cjs');

const routes = [
  { path: '/api/v1/auth', mod: '../src/modules/auth/auth.routes' },
  { path: '/api/v1/orders', mod: '../src/modules/orders/orders.routes' },
  { path: '/api/v1/products', mod: '../src/modules/products/products.routes' },
  { path: '/api/v1/customers', mod: '../src/modules/customers/customers.routes' },
  { path: '/api/v1/suppliers', mod: '../src/modules/suppliers/suppliers.routes' },
  { path: '/api/v1/employees', mod: '../src/modules/employees/employees.routes' },
  { path: '/api/v1/branches', mod: '../src/modules/branches/branches.routes' },
  { path: '/api/v1/settings', mod: '../src/modules/settings/settings.routes' },
  { path: '/api/v1/reports', mod: '../src/modules/reports/reports.routes' },
  { path: '/api/v1/dashboard', mod: '../src/modules/dashboard/dashboard.routes' },
  { path: '/api/v1/cash-register', mod: '../src/modules/cashRegister/cashRegister.routes' },
  { path: '/api/v1/hr', mod: '../src/modules/hr/hr.routes' },
  { path: '/api/v1/payroll', mod: '../src/modules/payroll/payroll.routes' },
  { path: '/api/v1/waste', mod: '../src/modules/waste/waste.routes' },
  { path: '/api/v1/expenses', mod: '../src/modules/expenses/expense.routes' },
  { path: '/api/v1/recipe', mod: '../src/modules/recipe/recipe.routes' },
  { path: '/api/v1/notifications', mod: '../src/modules/notifications/notification.routes' },
  { path: '/api/v1/inventory', mod: '../src/modules/inventory/inventory.routes' },
];

routes.forEach(({ path, mod }) => {
  try {
    app.use(path, require(mod).default);
  } catch(e) {
    console.error(`Route ${path}:`, e.message);
  }
});

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  const status = err.statusCode || 500;
  console.error('Error:', err.message, err.stack?.split('\n').slice(0, 3).join(' | '));
  res.status(status).json({ success: false, error: { code: err.code || 'INTERNAL_ERROR', message } });
});

module.exports = app;
