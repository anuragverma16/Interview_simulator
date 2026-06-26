import mongoose from 'mongoose';

const codingStreakSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    streakPoints: { type: Number, default: 0 },
    lastSolvedDate: { type: String, default: '' },
    todaySolved: { type: Boolean, default: false },
    todayProblemSlug: { type: String, default: '' },
    todayProblemDate: { type: String, default: '' },
    totalSolved: { type: Number, default: 0 },
    solvedSlugs: [String],
    missedChallenges: [{
      date: String,
      problemSlug: String,
      solved: { type: Boolean, default: false },
      pointsLost: { type: Number, default: 0 },
    }],
    streakHistory: [{ date: String, problemSlug: String, solved: Boolean, points: Number, catchUp: Boolean }],
    streakFreezes: { type: Number, default: 0 },
    freezeUsedDates: [String],
    certificatesEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('CodingStreak', codingStreakSchema);
