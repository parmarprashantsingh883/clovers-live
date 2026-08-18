import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import { corsOrigins, isProduction, isTest } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import orderRoutes from './routes/order.routes.js';
import userRoutes from './routes/user.routes.js';
import { adminStats } from './controllers/order.controller.js';
import { protect, adminOnly } from './middleware/auth.middleware.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

const app = express();
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
if (!isTest) app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(cors({ origin: corsOrigins(), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Strip NoSQL operator keys ($, .) from user input.
app.use((req, _res, next) => {
  const clean = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) delete obj[key];
      else clean(obj[key]);
    }
  };
  clean(req.body); clean(req.query); clean(req.params);
  next();
});

if (!isTest) {
  app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, standardHeaders: true, legacyHeaders: false }));
  app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many attempts — try again in 15 minutes.' } }));
}

app.get('/api/health', (_req, res) => res.json({ success: true, status: 'ok' }));
app.get('/api/ready', (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ success: ready });
});

app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes);            // /api/products, /api/categories, /api/*Banners
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.get('/api/admin/stats', protect, adminOnly, adminStats);

app.use(notFound);
app.use(errorHandler);

export default app;
