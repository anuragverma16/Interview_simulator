import mongoose from 'mongoose';

const userNotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    actionUrl: { type: String, default: '/dashboard' },
    actionLabel: { type: String, default: 'Open' },
    fromAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    kind: { type: String, enum: ['general', 'daily_problem'], default: 'general' },
    read: { type: Boolean, default: false },
    dismissed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model('UserNotification', userNotificationSchema);
