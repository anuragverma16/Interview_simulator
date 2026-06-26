import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    certId: { type: String, required: true, unique: true },
    type: { type: String, enum: ['daily_streak', 'milestone', 'course'], default: 'daily_streak' },
    title: { type: String, required: true },
    recipientName: String,
    streakDay: { type: Number, default: 1 },
    problemTitle: String,
    language: String,
    earnedAt: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model('Certificate', certificateSchema);
