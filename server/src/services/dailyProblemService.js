import DailyProblemSchedule from '../models/DailyProblemSchedule.js';
import User from '../models/User.js';
import UserNotification from '../models/UserNotification.js';
import AdminLog from '../models/AdminLog.js';
import { getProblemBySlug, getDailyStreakProblem, getDailyStreakProblemForDate, PROBLEMS } from '../data/leetcodeProblems.js';
import { todayStr, formatCountdown } from '../utils/dailyUtils.js';

export const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;

export function buildPublishAt(scheduleDate, timeStr = '00:00') {
  const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10) || 0);
  const d = new Date(`${scheduleDate}T00:00:00.000Z`);
  d.setUTCHours(h, m, 0, 0);
  return d;
}

export function getScheduleValidUntil(publishAt) {
  return new Date(new Date(publishAt).getTime() + DAILY_WINDOW_MS);
}

export async function getScheduleForDate(dateStr) {
  return DailyProblemSchedule.findOne({ scheduleDate: dateStr }).lean();
}

/** Returns problem if published and within 24h window; otherwise pending / expired schedule info. */
export async function resolveDailyProblem(date = new Date()) {
  const dateStr = todayStr(date);
  const now = new Date();
  const schedule = await getScheduleForDate(dateStr);

  if (schedule) {
    const publishAt = new Date(schedule.publishAt);
    const validUntil = getScheduleValidUntil(publishAt);
    const problem = getProblemBySlug(schedule.problemSlug);
    if (!problem) {
      return { problem: getDailyStreakProblem(date), pending: false, expired: false, schedule: null, adminScheduled: false };
    }

    if (now < publishAt) {
      return {
        problem: null,
        pending: true,
        expired: false,
        adminScheduled: true,
        schedule: { ...schedule, publishAt, validUntil, problemTitle: problem.title, problemDifficulty: problem.difficulty },
      };
    }

    if (now >= validUntil) {
      return {
        problem: null,
        pending: false,
        expired: true,
        adminScheduled: true,
        schedule: { ...schedule, publishAt, validUntil, problemTitle: problem.title, problemDifficulty: problem.difficulty },
      };
    }

    return {
      problem: { ...problem, dailyDate: dateStr, adminScheduled: true },
      pending: false,
      expired: false,
      adminScheduled: true,
      schedule: { ...schedule, publishAt, validUntil },
    };
  }

  return {
    problem: getDailyStreakProblem(date),
    pending: false,
    expired: false,
    adminScheduled: false,
    schedule: null,
  };
}

/** Live admin problem shown in user practice section (24h window, users only). */
export async function getAdminFeaturedPracticeProblem(date = new Date()) {
  const { problem, pending, expired, adminScheduled, schedule } = await resolveDailyProblem(date);
  if (!adminScheduled || pending || expired || !problem || !schedule) return null;

  const publishAt = new Date(schedule.publishAt);
  const validUntil = getScheduleValidUntil(publishAt);
  const remainingMs = Math.max(0, validUntil.getTime() - Date.now());

  return {
    slug: problem.slug,
    leetcodeId: problem.leetcodeId,
    title: problem.title,
    difficulty: problem.difficulty,
    tags: problem.tags,
    acceptance: problem.acceptance || null,
    generated: Boolean(problem.generated),
    validUntil: validUntil.toISOString(),
    remainingMs,
    timeRemaining: formatCountdown(remainingMs),
    adminScheduled: true,
  };
}

export async function resolveDailyProblemForDateStr(dateStr) {
  const schedule = await getScheduleForDate(dateStr);
  if (schedule) {
    const problem = getProblemBySlug(schedule.problemSlug);
    const publishAt = new Date(schedule.publishAt);
    const validUntil = getScheduleValidUntil(publishAt);
    const now = new Date();
    if (problem && now >= publishAt && now < validUntil) {
      return { ...problem, dailyDate: dateStr, adminScheduled: true };
    }
    if (problem && now >= publishAt) {
      return { ...problem, dailyDate: dateStr, adminScheduled: true };
    }
  }
  return getDailyStreakProblemForDate(dateStr);
}

export async function publishDueSchedules() {
  const now = new Date();
  const due = await DailyProblemSchedule.find({
    notificationSent: false,
    publishAt: { $lte: now },
  });

  for (const sched of due) {
    const problem = getProblemBySlug(sched.problemSlug);
    if (!problem) {
      sched.notificationSent = true;
      await sched.save();
      continue;
    }

    const users = await User.find({ role: 'user', isActive: { $ne: false } }).select('_id');
    const expiresAt = getScheduleValidUntil(sched.publishAt);
    const title = sched.customTitle?.trim() || 'New daily problem is live!';
    const message = `Today's challenge: ${problem.title} (${problem.difficulty}). Find it in Practice Problems — valid for 24 hours.`;

    if (users.length > 0) {
      await UserNotification.insertMany(
        users.map((u) => ({
          userId: u._id,
          title,
          message,
          actionUrl: `/coding?problem=${sched.problemSlug}`,
          actionLabel: 'Open in practice',
          fromAdminId: sched.createdBy,
          kind: 'daily_problem',
          expiresAt,
        })),
        { ordered: false }
      );
    }

    sched.notificationSent = true;
    await sched.save();

    if (sched.createdBy) {
      await AdminLog.create({
        adminId: sched.createdBy,
        action: 'publish_daily_problem',
        target: sched.scheduleDate,
        details: { problemSlug: sched.problemSlug, title: problem.title },
      });
    }

    console.log(`Daily problem published for ${sched.scheduleDate}: ${problem.title}`);
  }

  return due.length;
}

export function listProblemsForPicker({ search = '', limit = 50 } = {}) {
  let list = PROBLEMS;
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (p) => p.title.toLowerCase().includes(q) || p.slug.includes(q) || String(p.leetcodeId).includes(q)
    );
  }
  return list.slice(0, limit).map((p) => ({
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty,
    leetcodeId: p.leetcodeId,
    tags: p.tags?.slice(0, 3),
  }));
}

export function startDailyProblemScheduler(intervalMs = 60000) {
  publishDueSchedules().catch((err) => console.warn('Daily problem publish check:', err.message));
  return setInterval(() => {
    publishDueSchedules().catch((err) => console.warn('Daily problem publish check:', err.message));
  }, intervalMs);
}
