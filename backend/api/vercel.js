// api/vercel.js — Vercel Express Entry (CommonJS)
// tsx/cjs handles TypeScript imports at runtime
require('tsx/cjs');

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const { helmetMiddleware, apiRateLimiter, errorHandler } = require('../src/middleware/security');
const routes = require('../src/routes/vercel').default;

const app = express();

// Trust Vercel proxy (required for rate limiter on serverless)
app.set('trust proxy', 1);

app.use(helmetMiddleware);
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(apiRateLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/v1', routes);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Must be registered last
app.use(errorHandler);

module.exports = app;
