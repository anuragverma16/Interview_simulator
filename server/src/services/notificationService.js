import UserNotification from '../models/UserNotification.js';

export async function dismissDailyProblemNotifications(userId) {
  await UserNotification.updateMany(
    { userId, kind: 'daily_problem', dismissed: false },
    { dismissed: true, read: true }
  );
}
