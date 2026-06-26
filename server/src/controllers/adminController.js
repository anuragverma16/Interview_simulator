import User from '../models/User.js';
import Resume from '../models/Resume.js';
import Interview from '../models/Interview.js';
import CodingSession from '../models/CodingSession.js';
import CodingStreak from '../models/CodingStreak.js';
import UserAchievement from '../models/UserAchievement.js';
import UserNotification from '../models/UserNotification.js';
import AdminLog from '../models/AdminLog.js';
import DailyProblemSchedule from '../models/DailyProblemSchedule.js';
import { syncCodingXp } from '../services/achievementService.js';
import {
  buildPublishAt,
  buildEndAt,
  getScheduleValidUntil,
  listProblemsForPicker,
  publishDueSchedules,
  DAILY_WINDOW_MS,
} from '../services/dailyProblemService.js';
import { getProblemBySlug } from '../data/leetcodeProblems.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/helpers.js';

export const getStats = asyncHandler(async (req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const userOnly = { role: 'user' };

  const [
    totalUsers,
    totalInterviews,
    totalResumes,
    activeUsers,
    suspendedUsers,
    newUsersWeek,
    notificationsSent,
    codingSubmissions,
    recentLogs,
  ] = await Promise.all([
    User.countDocuments(userOnly),
    Interview.countDocuments(),
    Resume.countDocuments(),
    User.countDocuments({ ...userOnly, lastLogin: { $gte: dayAgo } }),
    User.countDocuments({ ...userOnly, isActive: false }),
    User.countDocuments({ ...userOnly, createdAt: { $gte: weekAgo } }),
    UserNotification.countDocuments(),
    CodingSession.countDocuments({ status: 'submitted' }),
    AdminLog.find().populate('adminId', 'name').sort({ createdAt: -1 }).limit(8).lean(),
  ]);

  const recentUsers = await User.find(userOnly).sort({ createdAt: -1 }).limit(8).select('name email createdAt stats role isActive');
  const registrations = await User.aggregate([
    { $match: { role: 'user', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const activityBreakdown = await Promise.all([
    Interview.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    CodingSession.aggregate([
      { $match: { status: 'submitted', createdAt: { $gte: weekAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  sendSuccess(res, {
    totalUsers,
    totalInterviews,
    totalResumes,
    activeUsers,
    suspendedUsers,
    newUsersWeek,
    notificationsSent,
    codingSubmissions,
    recentUsers,
    recentLogs,
    registrations,
    weeklyInterviews: activityBreakdown[0],
    weeklyCoding: activityBreakdown[1],
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20, status, role } = req.query;
  const query = { role: 'user' };
  if (search) {
    query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  }
  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;
  if (role === 'admin' || role === 'user') query.role = role;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  const users = await User.find(query)
    .select('-password -refreshToken')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const total = await User.countDocuments(query);
  sendSuccess(res, { users, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken');
  if (!user) throw new AppError('User not found', 404);

  await syncCodingXp(user._id);
  const freshUser = await User.findById(user._id).select('-password -refreshToken');

  const [interviewCount, resumeCount, codingSolved, streak, achievementCount, recentNotifications, recentInterviews, recentCoding, recentResumes] = await Promise.all([
    Interview.countDocuments({ userId: user._id }),
    Resume.countDocuments({ userId: user._id }),
    CodingSession.countDocuments({
      userId: user._id,
      status: 'submitted',
      'runResults.allPassed': true,
    }),
    CodingStreak.findOne({ userId: user._id }).lean(),
    UserAchievement.countDocuments({ userId: user._id }),
    UserNotification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('fromAdminId', 'name email')
      .lean(),
    Interview.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('type difficulty status analysis.overallScore duration createdAt completedAt')
      .lean(),
    CodingSession.find({ userId: user._id, status: 'submitted' })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('problem.title problem.difficulty language runResults mode createdAt submittedAt')
      .lean(),
    Resume.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fileName analysis.resumeScore createdAt')
      .lean(),
  ]);

  sendSuccess(res, {
    user: freshUser,
    activity: {
      interviews: interviewCount,
      resumes: resumeCount,
      codingSolved,
      achievements: achievementCount,
    },
    streak,
    notifications: recentNotifications,
    recentInterviews,
    recentCoding,
    recentResumes,
  });
});

function buildNotificationPayload(body, adminId) {
  const { title, message, actionUrl, actionLabel, expiresInHours } = body;
  if (!title?.trim() || !message?.trim()) {
    throw new AppError('Title and message are required', 400);
  }
  const hours = Math.min(Math.max(parseInt(expiresInHours || '24', 10), 1), 168);
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  return {
    title: title.trim(),
    message: message.trim(),
    actionUrl: actionUrl?.trim() || '/dashboard',
    actionLabel: actionLabel?.trim() || 'Open',
    fromAdminId: adminId,
    kind: 'general',
    expiresAt,
  };
}

export const sendUserNotification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user.role !== 'user') {
    throw new AppError('Notifications can only be sent to regular user accounts', 400);
  }
  if (user.isActive === false) {
    throw new AppError('Cannot send notifications to suspended users', 400);
  }

  const payload = buildNotificationPayload(req.body, req.user._id);
  const notification = await UserNotification.create({
    userId: user._id,
    ...payload,
  });

  await AdminLog.create({
    adminId: req.user._id,
    action: 'send_notification',
    target: user._id.toString(),
    details: { title: payload.title, expiresAt: payload.expiresAt },
  });

  sendSuccess(res, notification, 'Notification sent to user');
});

export const sendBroadcastNotification = asyncHandler(async (req, res) => {
  const payload = buildNotificationPayload(req.body, req.user._id);
  const users = await User.find({ role: 'user', isActive: { $ne: false } }).select('_id').lean();
  if (users.length === 0) {
    throw new AppError('No active users to notify', 400);
  }

  const docs = users.map((u) => ({
    userId: u._id,
    ...payload,
  }));
  await UserNotification.insertMany(docs, { ordered: false });

  await AdminLog.create({
    adminId: req.user._id,
    action: 'broadcast_notification',
    target: 'all_users',
    details: { title: payload.title, count: users.length, expiresAt: payload.expiresAt },
  });

  sendSuccess(res, { sent: users.length }, `Notification sent to ${users.length} users`);
});

export const updateUser = asyncHandler(async (req, res) => {
  const { role, isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);

  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  await user.save();

  await AdminLog.create({
    adminId: req.user._id,
    action: 'update_user',
    target: user._id.toString(),
    details: { role, isActive },
  });

  sendSuccess(res, user, 'User updated');
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'admin') throw new AppError('Cannot delete admin', 403);

  await user.deleteOne();
  await AdminLog.create({
    adminId: req.user._id,
    action: 'delete_user',
    target: req.params.id,
  });

  sendSuccess(res, null, 'User deleted');
});

export const getLogs = asyncHandler(async (req, res) => {
  const logs = await AdminLog.find().populate('adminId', 'name email').sort({ createdAt: -1 }).limit(50);
  sendSuccess(res, logs);
});

function enrichDailySchedule(schedule) {
  const publishAt = new Date(schedule.publishAt);
  const validUntil = getScheduleValidUntil(publishAt, schedule);
  const now = new Date();
  const problem = getProblemBySlug(schedule.problemSlug);

  let windowStatus = 'scheduled';
  if (now < publishAt) windowStatus = 'pending';
  else if (now >= validUntil) windowStatus = 'expired';
  else windowStatus = 'live';

  return {
    ...schedule,
    problemTitle: problem?.title,
    problemDifficulty: problem?.difficulty,
    publishAt: publishAt.toISOString(),
    validUntil: validUntil.toISOString(),
    endAt: validUntil.toISOString(),
    windowStatus,
    isLive: windowStatus === 'live',
    isExpired: windowStatus === 'expired',
    isPending: windowStatus === 'pending',
    isPublished: schedule.notificationSent && now >= publishAt,
    remainingMs: windowStatus === 'live' ? Math.max(0, validUntil.getTime() - now.getTime()) : 0,
  };
}

export const getDailyProblemSchedules = asyncHandler(async (req, res) => {
  const schedules = await DailyProblemSchedule.find()
    .sort({ scheduleDate: -1 })
    .limit(30)
    .populate('createdBy', 'name')
    .lean();

  sendSuccess(res, schedules.map(enrichDailySchedule));
});

export const getDailyProblemPicker = asyncHandler(async (req, res) => {
  const { search, limit } = req.query;
  sendSuccess(res, listProblemsForPicker({ search, limit: parseInt(limit || '40', 10) }));
});

export const upsertDailyProblemSchedule = asyncHandler(async (req, res) => {
  const { scheduleDate, problemSlug, publishTime, endDate, endTime, customTitle } = req.body;
  if (!scheduleDate || !problemSlug) {
    throw new AppError('Date and problem are required', 400);
  }

  const problem = getProblemBySlug(problemSlug);
  if (!problem) throw new AppError('Problem not found', 404);

  const publishAt = buildPublishAt(scheduleDate, publishTime || '00:00');
  const validUntil = endDate && endTime
    ? buildEndAt(endDate, endTime)
    : new Date(publishAt.getTime() + DAILY_WINDOW_MS);

  if (validUntil.getTime() <= publishAt.getTime()) {
    throw new AppError('End time must be after publish time', 400);
  }

  const now = new Date();

  const schedule = await DailyProblemSchedule.findOneAndUpdate(
    { scheduleDate },
    {
      problemSlug,
      publishAt,
      validUntil,
      customTitle: customTitle?.trim() || '',
      createdBy: req.user._id,
      notificationSent: false,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (now >= publishAt) {
    await publishDueSchedules();
  }

  await AdminLog.create({
    adminId: req.user._id,
    action: 'schedule_daily_problem',
    target: scheduleDate,
    details: { problemSlug, publishAt, validUntil, title: problem.title },
  });

  sendSuccess(res, enrichDailySchedule(schedule.toObject()), 'Daily problem scheduled');
});

export const deleteDailyProblemSchedule = asyncHandler(async (req, res) => {
  const deleted = await DailyProblemSchedule.findOneAndDelete({ scheduleDate: req.params.date });
  if (!deleted) throw new AppError('Schedule not found', 404);
  sendSuccess(res, null, 'Schedule removed');
});

export const publishDailyProblemNow = asyncHandler(async (req, res) => {
  const schedule = await DailyProblemSchedule.findOne({ scheduleDate: req.params.date });
  if (!schedule) throw new AppError('Schedule not found', 404);

  const oldPublish = new Date(schedule.publishAt);
  const oldEnd = getScheduleValidUntil(oldPublish, schedule);
  const windowMs = Math.max(60_000, oldEnd.getTime() - oldPublish.getTime());

  schedule.publishAt = new Date();
  schedule.validUntil = new Date(schedule.publishAt.getTime() + windowMs);
  schedule.notificationSent = false;
  await schedule.save();
  await publishDueSchedules();

  const fresh = await DailyProblemSchedule.findOne({ scheduleDate: req.params.date }).lean();
  sendSuccess(res, enrichDailySchedule(fresh), 'Daily problem published and users notified');
});

export const getLeaderboard = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 25 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));

  const allUsers = await User.find({ role: 'user' })
    .sort({ 'stats.xp': -1, name: 1 })
    .select('name email avatar stats isActive lastLogin createdAt')
    .lean();

  const rankMap = new Map(allUsers.map((u, i) => [String(u._id), i + 1]));

  let filtered = allUsers;
  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    filtered = allUsers.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const start = (pageNum - 1) * limitNum;
  const slice = filtered.slice(start, start + limitNum);
  const userIds = slice.map((u) => u._id);

  const streaks = await CodingStreak.find({ userId: { $in: userIds } })
    .select('userId currentStreak longestStreak totalSolved streakPoints')
    .lean();
  const streakByUser = new Map(streaks.map((s) => [String(s.userId), s]));

  const items = slice.map((u) => {
    const streak = streakByUser.get(String(u._id));
    return {
      rank: rankMap.get(String(u._id)) || 0,
      userId: u._id,
      name: u.name,
      email: u.email,
      avatar: u.avatar || '',
      xp: u.stats?.xp ?? 0,
      level: u.stats?.level ?? 1,
      streak: u.stats?.streak ?? 0,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      totalSolved: streak?.totalSolved ?? 0,
      isActive: u.isActive !== false,
      lastLogin: u.lastLogin,
      joinedAt: u.createdAt,
    };
  });

  const topThree = allUsers.slice(0, 3).map((u, i) => ({
    rank: i + 1,
    userId: u._id,
    name: u.name,
    avatar: u.avatar || '',
    xp: u.stats?.xp ?? 0,
    level: u.stats?.level ?? 1,
  }));

  sendSuccess(res, {
    items,
    topThree,
    total,
    page: pageNum,
    limit: limitNum,
    pages: Math.max(1, Math.ceil(total / limitNum)),
    totalUsers: allUsers.length,
  });
});
