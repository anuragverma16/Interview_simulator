import mongoose from 'mongoose';
import { config } from '../config/index.js';
import User from '../models/User.js';
import { ensureAchievements } from '../services/achievementSeed.js';

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

export const connectDB = async () => {
  const maxRetries = 5;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const conn = await mongoose.connect(config.mongodbUri);
      console.log(`MongoDB connected: ${conn.connection.host}`);
      await seedDemoUserIfEmpty();
      await seedAdminUserIfEmpty();
      await ensureAchievements();
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (attempt === maxRetries) {
        console.error('\n⚠️  MongoDB is required for login. Options:');
        console.error('   1. Install MongoDB locally and start the service');
        console.error('   2. Use MongoDB Atlas — set MONGODB_URI in server/.env\n');
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
