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

// Load tsx for TypeScript
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
try { app.use('/api/v1/hr', require('../src/modules/hr/hr.routes').default); } catch(e) { console.error('hr:', e.message); }
try { app.use('/api/v1/payroll', require('../src/modules/payroll/payroll.routes').default); } catch(e) { console.error('payroll:', e.message); }
try { app.use('/api/v1/waste', require('../src/modules/waste/waste.routes').default); } catch(e) { console.error('waste:', e.message); }
try { app.use('/api/v1/expenses', require('../src/modules/expenses/expense.routes').default); } catch(e) { console.error('expenses:', e.message); }
try { app.use('/api/v1/recipe', require('../src/modules/recipe/recipe.routes').default); } catch(e) { console.error('recipe:', e.message); }
try { app.use('/api/v1/notifications', require('../src/modules/notifications/notification.routes').default); } catch(e) { console.error('notifications:', e.message); }
try { app.use('/api/v1/inventory', require('../src/modules/inventory/inventory.routes').default); } catch(e) { console.error('inventory:', e.message); }

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  const msg = err.message || 'Internal server error';
  const status = err.statusCode || 500;
  console.error('Error:', msg);
  res.status(status).json({ success: false, error: { code: err.code || 'INTERNAL_ERROR', message: msg } });
});

module.exports = app;
