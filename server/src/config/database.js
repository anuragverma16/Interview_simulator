import mongoose from 'mongoose';
import { config, isCloudHost } from '../config/index.js';
import User from '../models/User.js';
import { ensureAchievements } from '../services/achievementSeed.js';

let reconnectTimer = null;
let reconnecting = false;
let shuttingDown = false;

async function seedDemoUserIfEmpty() {
  try {
    const exists = await User.exists({ email: 'demo@interviewiq.com' });
    if (!exists) {
      await User.create({ name: 'Demo User', email: 'demo@interviewiq.com', password: 'demo123' });
      console.log('Demo account ready: demo@interviewiq.com / demo123');
    }
  } catch (error) {
    console.warn('Demo user seed skipped:', error.message);
  }
}

async function seedAdminUserIfEmpty() {
  const email = 'admin@interviewiq.com';
  try {
    const existing = await User.findOne({ email });
    if (!existing) {
      await User.create({ name: 'Admin', email, password: 'admin123', role: 'admin' });
      console.log('Admin account ready: admin@interviewiq.com / admin123');
      return;
    }
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`Promoted ${email} to admin — use your existing password to sign in`);
    }
  } catch (error) {
    console.warn('Admin user seed skipped:', error.message);
  }
}

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
};

function mongoHostHint(uri) {
  const match = uri.match(/@([^/?]+)/);
  return match ? match[1] : 'unknown host';
}

function hasMongoEnvVar() {
  return Boolean(process.env.MONGODB_URI || process.env.DATABASE_URL);
}

function logMongoConfig() {
  console.log('--- Environment check ---');
  console.log(`  NODE_ENV: ${config.nodeEnv}${isCloudHost ? ' (cloud host detected)' : ''}`);
  console.log(`  MONGODB_URI: ${process.env.MONGODB_URI ? 'set' : 'MISSING'}`);
  console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? 'set' : 'not set'}`);
  console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? 'set' : 'MISSING'}`);
  console.log(`  CLIENT_URL: ${process.env.CLIENT_URL || '(default localhost:5173)'}`);
  console.log('-------------------------');

  if (hasMongoEnvVar()) {
    console.log(`MongoDB target: ${mongoHostHint(config.mongodbUri)}`);
  } else {
    console.warn('MongoDB: no MONGODB_URI or DATABASE_URL — using localhost (local dev only)');
  }
}

function assertMongoConfigured() {
  const uri = config.mongodbUri;
  const pointsToLocalhost = /localhost|127\.0\.0\.1|::1/.test(uri);
  const missingEnv = !hasMongoEnvVar();
  const isProduction = config.nodeEnv === 'production' || isCloudHost;

  if (isProduction && (missingEnv || pointsToLocalhost)) {
    throw new Error(
      'MONGODB_URI is required on Render/cloud hosting.\n'
      + '  1. Open Render Dashboard → your service → Environment\n'
      + '  2. Add MONGODB_URI = your MongoDB Atlas connection string\n'
      + '     Example: mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/interviewiq?retryWrites=true&w=majority\n'
      + '  3. In Atlas: Network Access → allow 0.0.0.0/0\n'
      + '  4. Save and redeploy\n'
      + '  (server/.env on your PC is NOT uploaded — set vars in Render dashboard)'
    );
  }
}

async function runSeeds() {
  await seedDemoUserIfEmpty();
  await seedAdminUserIfEmpty();
  await ensureAchievements();
}

async function connectOnce() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  const conn = await mongoose.connect(config.mongodbUri, MONGO_OPTIONS);
  console.log(`MongoDB connected: ${conn.connection.host}`);
  await runSeeds();
  return conn;
}

function scheduleReconnect() {
  if (shuttingDown || reconnectTimer || reconnecting) return;

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    if (shuttingDown || mongoose.connection.readyState === 1) return;

    reconnecting = true;
    try {
      console.log('MongoDB reconnecting…');
      await connectOnce();
      console.log('MongoDB reconnected');
    } catch (error) {
      console.error('MongoDB reconnect failed:', error.message);
      scheduleReconnect();
    } finally {
      reconnecting = false;
    }
  }, 5000);
  reconnectTimer.unref?.();
}

export function markDbShuttingDown() {
  shuttingDown = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

export const connectDB = async () => {
  logMongoConfig();
  assertMongoConfigured();

  const maxRetries = config.nodeEnv === 'production' || isCloudHost ? 10 : 5;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await connectOnce();
      return;
    } catch (error) {
      lastError = error;
      console.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  throw lastError || new Error('MongoDB connection failed');
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
  if (!shuttingDown) scheduleReconnect();
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected (driver)');
});
