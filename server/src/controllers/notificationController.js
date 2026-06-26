import UserNotification from '../models/UserNotification.js';
import { asyncHandler, sendSuccess } from '../utils/helpers.js';
export const getMyNotifications = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    return sendSuccess(res, []);
  }
  const now = new Date();
  await UserNotification.deleteMany({ userId: req.user._id, expiresAt: { $lt: now } });

  const items = await UserNotification.find({
    userId: req.user._id,
    expiresAt: { $gt: now },
    dismissed: false,
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate('fromAdminId', 'name')
    .lean();

  sendSuccess(res, items);
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const item = await UserNotification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true },
    { new: true }
  );
  sendSuccess(res, item);
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    return sendSuccess(res, { updated: 0 });
  }
  const result = await UserNotification.updateMany(
    { userId: req.user._id, read: false, dismissed: false },
    { read: true }
  );
  sendSuccess(res, { updated: result.modifiedCount });
});

export const dismissNotification = asyncHandler(async (req, res) => {
  const item = await UserNotification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { dismissed: true, read: true },
    { new: true }
  );
  sendSuccess(res, item);
});
