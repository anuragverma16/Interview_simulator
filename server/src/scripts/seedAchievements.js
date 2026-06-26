import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Achievement from '../models/Achievement.js';
import { connectDB } from '../config/database.js';
import { ensureAchievements } from '../services/achievementSeed.js';

dotenv.config();

const seed = async () => {
  await connectDB();
  await ensureAchievements();
  console.log('Achievements seeded successfully');
  await mongoose.disconnect();
};

seed().catch(console.error);
