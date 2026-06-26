import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '🏆' },
  category: {
    type: String,
    enum: ['interview', 'coding', 'learning', 'streak', 'special'],
    default: 'special',
  },
  xpReward: { type: Number, default: 50 },
  criteria: { type: { type: String }, threshold: Number },
});

export default mongoose.model('Achievement', achievementSchema);
