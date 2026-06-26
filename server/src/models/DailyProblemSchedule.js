import mongoose from 'mongoose';

const dailyProblemScheduleSchema = new mongoose.Schema(
  {
    scheduleDate: { type: String, required: true, unique: true, index: true },
    problemSlug: { type: String, required: true },
    publishAt: { type: Date, required: true, index: true },
    notificationSent: { type: Boolean, default: false },
    customTitle: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('DailyProblemSchedule', dailyProblemScheduleSchema);
