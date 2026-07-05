import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { config } from './config/index.js';
import { connectDB, markDbShuttingDown } from './config/database.js';
import { verifyProductionEnv } from './config/verifyEnv.js';
import { errorHandler, notFound, authenticate } from './middleware/index.js';
import { getMe } from './controllers/authController.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import skillGapRoutes from './routes/skillGapRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import codingRoutes from './routes/codingRoutes.js';
import careerRoutes from './routes/careerRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import { warmJavaRuntime } from './services/codeRunner.js';
import { startDailyProblemScheduler } from './services/dailyProblemService.js';
import { uploadDir } from './middleware/upload.js';

const app = express();
const isDev = config.nodeEnv === 'development';
const MAX_PORT_RETRIES = isDev ? 30 : 0;

app.use('/uploads', express.static(uploadDir));

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.clientOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    success: dbReady,
    message: dbReady ? 'InterviewIQ AI API is running' : 'API up but database not connected',
    aiConfigured: Boolean(config.geminiApiKey),
    database: dbReady ? 'connected' : 'disconnected',
  });
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 5000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again in a few minutes.' },
  skip: (req) => {
    const path = req.path || '';
    return path === '/v1/auth/login'
      || path === '/v1/auth/register'
      || path === '/v1/auth/refresh';
  },
});
app.use('/api', apiLimiter);

app.use('/api/v1/auth', authRoutes);
app.get('/api/v1/auth/me', authenticate, getMe);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/skill-gap', skillGapRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/coding', codingRoutes);
app.use('/api/v1/career', careerRoutes);
app.use('/api/v1/roadmap', roadmapRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/achievements', achievementRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

let server = null;
let shuttingDown = false;
let dailyScheduler = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function listenOnce() {
  return new Promise((resolve, reject) => {
    const instance = http.createServer(app);

    const onError = (err) => {
      instance.removeListener('listening', onListening);
      instance.close(() => reject(err));
    };

    const onListening = () => {
      instance.removeListener('error', onError);
      resolve(instance);
    };

    instance.once('error', onError);
    instance.once('listening', onListening);

    instance.listen({
      port: Number(config.port),
      host: '0.0.0.0',
      exclusive: !isDev,
    });
  });
}

async function startServer() {
  verifyProductionEnv();
  await connectDB();

  for (let attempt = 0; attempt <= MAX_PORT_RETRIES; attempt += 1) {
    if (shuttingDown) return;

    try {
      server = await listenOnce();
      console.log(`InterviewIQ AI Server running on port ${config.port}`);
      warmJavaRuntime().catch(() => {});
      dailyScheduler = startDailyProblemScheduler(60000);
      return;
    } catch (err) {
      if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_RETRIES) {
        const wait = Math.min(400 + attempt * 200, 3000);
        if (attempt === 0) {
          console.warn(`Port ${config.port} busy — waiting for previous dev instance to release…`);
        }
        await sleep(wait);
        continue;
      }

      if (err.code === 'EADDRINUSE') {
        console.error(
          `Port ${config.port} is still in use. Run only one dev server (root OR server folder, not both).`
        );
        console.error(`Or set a different PORT in server/.env`);
        process.exit(1);
      }

      throw err;
    }
  }
}

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  markDbShuttingDown();

  if (dailyScheduler) {
    clearInterval(dailyScheduler);
    dailyScheduler = null;
  }

  const exitClean = () => {
    mongoose.connection.close().catch(() => {});
    process.exit(0);
  };

  if (!server) {
    exitClean();
    return;
  }

  if (typeof server.closeAllConnections === 'function') {
    server.closeAllConnections();
  }

  server.close(exitClean);
  setTimeout(exitClean, isDev ? 250 : 800).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;