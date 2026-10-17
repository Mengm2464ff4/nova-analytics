import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import { logger } from './utils/logger';
import { errorHandler, notFound } from './middleware/errorHandler';
import { initRealtime } from './services/realtime.service';

import authRoutes from './routes/auth';
import trackRoutes from './routes/track';
import sitesRoutes from './routes/sites';
import analyticsRoutes from './routes/analytics';
import widgetsRoutes from './routes/widgets';
import reportsRoutes from './routes/reports';
import usersRoutes from './routes/users';
import adminRoutes from './routes/admin';

const app = express();
const server = http.createServer(app);

// Trust proxy (Railway/Render/nginx) so req.ip is the real client IP
app.set('trust proxy', 1);

// ---------- Security & perf ----------
app.use(
  helmet({
    // Allow tracker script to be embedded on other sites
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(compression());

// ---------- CORS ----------
// Strict CORS for API routes used by your dashboard
const DASHBOARD_ORIGINS = (
  process.env.CORS_ORIGIN?.split(',') ?? [
    'http://localhost:3000',
    'http://localhost:5000',
  ]
).map((o) => o.trim());

app.use(
  cors({
    origin: DASHBOARD_ORIGINS,
    credentials: true,
  })
);

// Allow the public tracker endpoint to be called from any website
app.options('/api/track', cors({ origin: '*' }));
app.use('/api/track', cors({ origin: '*' }));

// ---------- Body parsing ----------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------- Request logging (dev only) ----------
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });
}

// ---------- Health ----------
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'nova-analytics-backend',
    time: new Date().toISOString(),
  });
});

// ---------- Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/sites', sitesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/widgets', widgetsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);

// ---------- Errors ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Realtime ----------
initRealtime(server);

// ---------- Start ----------
const PORT = Number(process.env.PORT) || 4000;
server.listen(PORT, () => {
  logger.info(`🚀 Nova Analytics backend running on http://localhost:${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌍 CORS origins: ${DASHBOARD_ORIGINS.join(', ')}`);
});

export default app;