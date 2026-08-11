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

try { app.use('/api/v1/auth', require('../src/modules/auth/auth.routes').default); } catch(e) { console.error('auth:', e.message); }
try { app.use('/api/v1/orders', require('../src/modules/orders/orders.routes').default); } catch(e) { console.error('orders:', e.message); }
try { app.use('/api/v1/products', require('../src/modules/products/products.routes').default); } catch(e) { console.error('products:', e.message); }
try { app.use('/api/v1/customers', require('../src/modules/customers/customers.routes').default); } catch(e) { console.error('customers:', e.message); }
try { app.use('/api/v1/suppliers', require('../src/modules/suppliers/suppliers.routes').default); } catch(e) { console.error('suppliers:', e.message); }
try { app.use('/api/v1/employees', require('../src/modules/employees/employees.routes').default); } catch(e) { console.error('employees:', e.message); }
try { app.use('/api/v1/branches', require('../src/modules/branches/branches.routes').default); } catch(e) { console.error('branches:', e.message); }
try { app.use('/api/v1/settings', require('../src/modules/settings/settings.routes').default); } catch(e) { console.error('settings:', e.message); }
try { app.use('/api/v1/reports', require('../src/modules/reports/reports.routes').default); } catch(e) { console.error('reports:', e.message); }
try { app.use('/api/v1/dashboard', require('../src/modules/dashboard/dashboard.routes').default); } catch(e) { console.error('dashboard:', e.message); }
try { app.use('/api/v1/cash-register', require('../src/modules/cashRegister/cashRegister.routes').default); } catch(e) { console.error('cashRegister:', e.message); }

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
