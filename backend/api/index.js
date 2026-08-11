// Vercel serverless Express entrypoint — self-contained (no TS imports)
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// ========== Security Middleware ==========
const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
});

const apiRateLimiter = rateLimit({
  windowMs: 60000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// ========== Express App ==========
const app = express();

app.set('trust proxy', 1);

app.use(helmetMiddleware);
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(apiRateLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

require('tsx/cjs');

// Auth
app.use('/api/v1/auth', require('../src/modules/auth/auth.routes').default);
// Orders (P1-P10: Complete, Cancel, Refund, Split, Merge, Hold/Resume)
app.use('/api/v1/orders', require('../src/modules/orders/orders.routes').default);
// Products
app.use('/api/v1/products', require('../src/modules/products/products.routes').default);
// Customers
app.use('/api/v1/customers', require('../src/modules/customers/customers.routes').default);
// Suppliers
app.use('/api/v1/suppliers', require('../src/modules/suppliers/suppliers.routes').default);
// Employees
app.use('/api/v1/employees', require('../src/modules/employees/employees.routes').default);
// Branches
app.use('/api/v1/branches', require('../src/modules/branches/branches.routes').default);
// Settings
app.use('/api/v1/settings', require('../src/modules/settings/settings.routes').default);
// Reports
app.use('/api/v1/reports', require('../src/modules/reports/reports.routes').default);
// Dashboard
app.use('/api/v1/dashboard', require('../src/modules/dashboard/dashboard.routes').default);
// Cash Register (P3: Sale receipts, refund payouts)
app.use('/api/v1/cash-register', require('../src/modules/cashRegister/cashRegister.routes').default);
// HR (Advances, Penalties, Rewards, Leaves, Shifts)
app.use('/api/v1/hr', require('../src/modules/hr/hr.routes').default);
// Payroll (P11-P13: Real attendance-based payroll, lock workflow)
app.use('/api/v1/payroll', require('../src/modules/payroll/payroll.routes').default);
// Waste (P16: Real cost calculation)
app.use('/api/v1/waste', require('../src/modules/waste/waste.routes').default);
// Expenses
app.use('/api/v1/expenses', require('../src/modules/expenses/expense.routes').default);
// Recipe (P17: Recipe explosion on sale)
app.use('/api/v1/recipe', require('../src/modules/recipe/recipe.routes').default);
// Notifications
app.use('/api/v1/notifications', require('../src/modules/notifications/notification.routes').default);
// Inventory (P4: Stock deduction, P14: Warehouse authorization, P18: Return)
app.use('/api/v1/inventory', require('../src/modules/inventory/inventory.routes').default);

class AppError extends Error {
  constructor(message, statusCode = 400, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'APP_ERROR';
  }
}

function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
}

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

module.exports = app;
