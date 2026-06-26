import CodingSession from '../models/CodingSession.js';
import CodingStreak from '../models/CodingStreak.js';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import { reviewCode } from '../services/aiService.js';
import { runCodeAsync, buildLocalFeedback } from '../services/codeRunner.js';
import { issueCertificate, buildCertificateHtml, syncMilestoneCertificates } from '../services/certificateService.js';
import { syncCodingXp, checkAchievements } from '../services/achievementService.js';
import { getMissedDates, syncMissedDays, breakStreak, syncUserStreakStat, syncStreakPoints } from '../services/dailyChallengeService.js';
import {
  todayStr,
  yesterdayStr,
  getNextResetAt,
  getTimeRemainingMs,
  formatCountdown,
  calculateDailyReward,
  buildStreakCalendar,
  buildStreakCalendarForMonth,
  getStreakCalendarMeta,
  POINTS,
} from '../utils/dailyUtils.js';
import {
  PROBLEMS,
  getProblemBySlug,
  getProblemByLeetcodeId,
  getProblemsByDifficulty,
  getStarterCode,
  formatProblemForClient,
  filterProblems,
  getTopics,
} from '../data/leetcodeProblems.js';
import { resolveDailyProblem, resolveDailyProblemForDateStr, getAdminFeaturedPracticeProblem, getScheduleValidUntil } from '../services/dailyProblemService.js';
import { dismissDailyProblemNotifications } from '../services/notificationService.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/helpers.js';

async function getOrCreateStreak(userId) {
  let streak = await CodingStreak.findOne({ userId });
  if (!streak) streak = await CodingStreak.create({ userId });
  return streak;
}

async function getUserSolvedSlugs(userId) {
  const [streak, sessionSlugs] = await Promise.all([
    CodingStreak.findOne({ userId }).select('solvedSlugs').lean(),
    CodingSession.distinct('problemSlug', {
      userId,
      status: 'submitted',
      'runResults.allPassed': true,
    }),
  ]);
  return [...new Set([...(streak?.solvedSlugs || []), ...sessionSlugs.filter(Boolean)])];
}

async function markProblemSolved(userId, problemSlug) {
  if (!problemSlug) return;
  const streak = await getOrCreateStreak(userId);
  if (!streak.solvedSlugs.includes(problemSlug)) {
    streak.solvedSlugs.push(problemSlug);
    await streak.save();
  }
}

async function completeDailyChallenge(userId, problemSlug, options = {}) {
  const { isCatchUp = false, catchUpDate = null, language = 'javascript', problemTitle = '' } = options;
  let streak = await getOrCreateStreak(userId);
  streak = await syncMissedDays(streak);
  const today = todayStr();

  if (isCatchUp && catchUpDate) {
    const miss = streak.missedChallenges.find((m) => m.date === catchUpDate);
    if (miss) {
      miss.solved = true;
    }
    const reward = calculateDailyReward(true, streak.currentStreak);
    streak.totalSolved += 1;
    if (!streak.solvedSlugs.includes(problemSlug)) streak.solvedSlugs.push(problemSlug);
    streak.streakHistory.push({ date: catchUpDate, problemSlug, solved: true, points: reward.points, catchUp: true });
    await streak.save();
    return { streak, reward, certificate: null };
  }

  if (streak.lastSolvedDate === today && streak.todaySolved) {
    return { streak, reward: null, certificate: null };
  }

  const yesterday = yesterdayStr();
  if (streak.lastSolvedDate === yesterday) {
    streak.currentStreak += 1;
  } else if (streak.lastSolvedDate !== today) {
    // Missed one or more days — start fresh at 1 (not a continuation)
    streak.currentStreak = 1;
  }

  const prevLongest = streak.longestStreak;
  streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
  if (streak.longestStreak > prevLongest) {
    streak.streakFreezes = (streak.streakFreezes || 0) + 1;
  }
  streak.lastSolvedDate = today;
  streak.todaySolved = true;
  streak.todayProblemDate = today;
  streak.todayProblemSlug = problemSlug;
  streak.totalSolved += 1;

  const reward = calculateDailyReward(false, streak.currentStreak);
  syncStreakPoints(streak);

  if (!streak.solvedSlugs.includes(problemSlug)) streak.solvedSlugs.push(problemSlug);
  streak.streakHistory.push({ date: today, problemSlug, solved: true, points: reward.points, catchUp: false });

  const user = await User.findById(userId);
  if (user) {
    user.stats.streak = streak.currentStreak;
    await user.save();
  }

  await streak.save();

  if (!isCatchUp) {
    await dismissDailyProblemNotifications(userId);
  }

  let certificate = null;
  if (streak.currentStreak >= 1) {
    certificate = await issueCertificate(userId, {
      currentStreak: streak.currentStreak,
      problemTitle,
      language,
      pointsEarned: reward.points,
      date: today,
    });
    streak.certificatesEarned = (streak.certificatesEarned || 0) + 1;
    await streak.save();
  }

  const milestoneCerts = await syncMilestoneCertificates(userId, {
    problemTitle,
    language,
    date: today,
  }, streak);
  const milestoneToday = milestoneCerts.find((c) => c.streakDay === streak.currentStreak);
  if (milestoneToday) certificate = milestoneToday;

  await checkAchievements(userId);

  return { streak, reward, certificate };
}

function createSessionPayload(problem, language) {
  return {
    slug: problem.slug,
    leetcodeId: problem.leetcodeId,
    title: problem.title,
    difficulty: problem.difficulty,
    tags: problem.tags,
    acceptance: problem.acceptance,
    description: problem.description,
    examples: problem.examples,
    constraints: problem.constraints,
    functionName: problem.functionName,
    returnType: problem.returnType,
    paramOrder: problem.paramOrder,
    parameters: problem.parameters,
    dailyDate: problem.dailyDate,
    testCases: problem.testCases
      .filter((tc) => !tc.hidden)
      .map((tc) => ({
        input: problem.paramOrder.map((p) => `${p} = ${JSON.stringify(tc.input[p])}`).join(', '),
        expected: JSON.stringify(tc.expected),
      })),
  };
}

export const getProblems = asyncHandler(async (req, res) => {
  const { search, difficulty, topic, sort, page, limit } = req.query;
  const result = filterProblems({
    search,
    difficulty,
    topic,
    sort: sort || 'leetcodeId',
    page: parseInt(page || '1', 10),
    limit: parseInt(limit || '20', 10),
  });

  const solvedSlugs = await getUserSolvedSlugs(req.user._id);
  const solvedSet = new Set(solvedSlugs);
  const mapped = result.items.map((p) => ({ ...p, solved: solvedSet.has(p.slug) }));

  let featuredPracticeProblem = null;
  if (req.user.role !== 'admin') {
    featuredPracticeProblem = await getAdminFeaturedPracticeProblem();
    if (featuredPracticeProblem) {
      featuredPracticeProblem.solved = solvedSet.has(featuredPracticeProblem.slug);
    }
  }

  sendSuccess(res, {
    ...result,
    items: mapped,
    solvedSlugs,
    totalProblems: PROBLEMS.length,
    featuredPracticeProblem,
  });
});

export const getTopicsList = asyncHandler(async (_req, res) => {
  sendSuccess(res, getTopics());
});

export const getProblemDetail = asyncHandler(async (req, res) => {
  const problem = getProblemBySlug(req.params.slug);
  if (!problem) throw new AppError('Problem not found', 404);
  sendSuccess(res, formatProblemForClient(problem));
});

export const getProblemByNumber = asyncHandler(async (req, res) => {
  const problem = getProblemByLeetcodeId(req.params.id);
  if (!problem) {
    throw new AppError(`No problem #${req.params.id} in the bank. Try search by title or browse all problems.`, 404);
  }
  sendSuccess(res, {
    slug: problem.slug,
    leetcodeId: problem.leetcodeId,
    title: problem.title,
    generated: Boolean(problem.generated),
    detail: formatProblemForClient(problem),
  });
});

export const getProblemStarter = asyncHandler(async (req, res) => {
  const problem = getProblemBySlug(req.params.slug);
  if (!problem) throw new AppError('Problem not found', 404);
  const { language } = req.params;
  const allowed = ['javascript', 'python', 'java', 'cpp', 'c'];
  if (!allowed.includes(language)) throw new AppError('Unsupported language', 400);
  sendSuccess(res, { code: getStarterCode(problem, language), language });
});

export const changeSessionLanguage = asyncHandler(async (req, res) => {
  const { language } = req.body;
  const allowed = ['javascript', 'python', 'java', 'cpp', 'c'];
  if (!allowed.includes(language)) throw new AppError('Unsupported language', 400);

  const session = await CodingSession.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) throw new AppError('Session not found', 404);

  const problem = getProblemBySlug(session.problemSlug);
  if (!problem) throw new AppError('Problem data not found', 404);

  session.language = language;
  session.code = getStarterCode(problem, language);
  await session.save();
  sendSuccess(res, session);
});

export const getStreak = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    throw new AppError('Daily streak is only available for user accounts', 403);
  }

  let streak = await getOrCreateStreak(req.user._id);
  streak = await syncMissedDays(streak);

  const today = todayStr();
  const now = new Date();
  const { problem: dailyProblem, pending, expired, schedule, adminScheduled } = await resolveDailyProblem();

  if (expired && schedule && streak.lastSolvedDate !== today) {
    const exists = streak.missedChallenges.some((m) => m.date === today);
    if (!exists) {
      streak.missedChallenges.push({
        date: today,
        problemSlug: schedule.problemSlug,
        solved: false,
        pointsLost: POINTS.DAILY_MISSED_PENALTY,
      });
      await breakStreak(streak);
      await streak.save();
    } else if (streak.currentStreak > 0) {
      await breakStreak(streak);
      await streak.save();
    }
  }

  const missed = await Promise.all(
    getMissedDates(streak).map(async (m) => {
      const plain = m.toObject ? m.toObject() : m;
      const prob = getProblemBySlug(plain.problemSlug) || await resolveDailyProblemForDateStr(plain.date);
      return {
        ...plain,
        problem: prob ? { slug: prob.slug, title: prob.title, difficulty: prob.difficulty, leetcodeId: prob.leetcodeId } : null,
      };
    })
  );

  if (dailyProblem && streak.todayProblemDate !== today) {
    streak.todayProblemSlug = dailyProblem.slug;
    streak.todayProblemDate = today;
    streak.todaySolved = streak.lastSolvedDate === today && streak.todaySolved;
    await streak.save();
  }

  const certs = await Certificate.find({ userId: req.user._id }).sort({ earnedAt: -1 }).limit(10);
  const solvedSlugs = await getUserSolvedSlugs(req.user._id);

  syncStreakPoints(streak);
  if (streak.isModified('streakPoints')) await streak.save();

  const meta = getStreakCalendarMeta(streak);
  const year = parseInt(req.query.year || String(meta.currentYear), 10);
  const month = parseInt(req.query.month || String(meta.currentMonth), 10);
  const safeYear = Number.isFinite(year) ? year : meta.currentYear;
  const safeMonth = Number.isFinite(month) && month >= 1 && month <= 12 ? month : meta.currentMonth;
  const monthCalendar = buildStreakCalendarForMonth(streak, safeYear, safeMonth);

  const publishAt = schedule?.publishAt ? new Date(schedule.publishAt) : null;
  const validUntil = schedule?.validUntil
    ? new Date(schedule.validUntil)
    : (publishAt ? getScheduleValidUntil(publishAt) : null);

  let nextResetAt;
  let remainingMs;
  if (adminScheduled && pending && publishAt) {
    nextResetAt = publishAt.toISOString();
    remainingMs = Math.max(0, publishAt.getTime() - now.getTime());
  } else if (adminScheduled && dailyProblem && validUntil) {
    nextResetAt = validUntil.toISOString();
    remainingMs = Math.max(0, validUntil.getTime() - now.getTime());
  } else {
    nextResetAt = getNextResetAt();
    remainingMs = getTimeRemainingMs();
  }

  sendSuccess(res, {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    streakPoints: streak.streakPoints,
    totalSolved: streak.totalSolved,
    todaySolved: streak.lastSolvedDate === today && streak.todaySolved,
    todayProblem: dailyProblem ? formatProblemForClient(dailyProblem) : null,
    dailyDate: today,
    dailyProblemPending: pending,
    dailyProblemExpired: expired,
    adminScheduledDaily: adminScheduled,
    dailyValidUntil: validUntil?.toISOString() || null,
    dailyProblemPublishAt: publishAt?.toISOString() || null,
    dailyProblemPublishLabel: publishAt
      ? publishAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' }) + ' UTC'
      : null,
    scheduledProblemTitle: schedule?.problemTitle || null,
    nextResetAt,
    timeRemaining: formatCountdown(remainingMs),
    timeRemainingMs: remainingMs,
    missedChallenges: missed,
    solvedSlugs,
    streakHistory: streak.streakHistory,
    streakCalendar: monthCalendar.days,
    streakCalendarMeta: {
      ...meta,
      selectedYear: safeYear,
      selectedMonth: safeMonth,
      firstWeekday: monthCalendar.firstWeekday,
      daysInMonth: monthCalendar.daysInMonth,
      monthStats: monthCalendar.monthStats,
    },
    streakFreezes: streak.streakFreezes || 0,
    freezeUsedDates: streak.freezeUsedDates || [],
    certificates: certs,
    totalProblems: PROBLEMS.length,
    pointsInfo: {
      dailyReward: POINTS.DAILY_ON_TIME,
      catchUpReward: POINTS.CATCH_UP_REWARD,
      missedPenalty: POINTS.DAILY_MISSED_PENALTY,
    },
  });
});

export const startStreak = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    throw new AppError('Daily streak is only available for user accounts', 403);
  }

  const { language, catchUp, catchUpDate } = req.body;
  if (!language) throw new AppError('Language is required', 400);

  const streak = await syncMissedDays(await getOrCreateStreak(req.user._id));
  const today = todayStr();

  let problem;
  let mode = 'streak';
  let sessionCatchUpDate = '';

  if (catchUp && catchUpDate) {
    const miss = streak.missedChallenges.find((m) => m.date === catchUpDate && !m.solved);
    if (!miss) throw new AppError('No missed challenge for that date', 400);
    problem = getProblemBySlug(miss.problemSlug) || await resolveDailyProblemForDateStr(catchUpDate);
    mode = 'catchup';
    sessionCatchUpDate = catchUpDate;
  } else {
    if (streak.lastSolvedDate === today && streak.todaySolved) {
      throw new AppError("You've already completed today's challenge!", 400);
    }
    const resolved = await resolveDailyProblem();
    if (resolved.expired) {
      throw new AppError('Today\'s daily challenge window has ended (24 hours). Check missed challenges.', 403);
    }
    if (resolved.pending || !resolved.problem) {
      throw new AppError(
        resolved.schedule?.publishAt
          ? `Daily problem unlocks at ${new Date(resolved.schedule.publishAt).toISOString()}`
          : 'Daily problem not available yet',
        403
      );
    }
    problem = resolved.problem;
  }

  const session = await CodingSession.create({
    userId: req.user._id,
    language,
    mode,
    catchUpDate: sessionCatchUpDate,
    problemSlug: problem.slug,
    problem: createSessionPayload(problem, language),
    code: getStarterCode(problem, language),
  });

  const { pending, expired, schedule, adminScheduled } = await resolveDailyProblem();
  const now = new Date();
  const publishAt = schedule?.publishAt ? new Date(schedule.publishAt) : null;
  const validUntil = schedule?.validUntil
    ? new Date(schedule.validUntil)
    : (publishAt ? getScheduleValidUntil(publishAt) : null);
  let remainingMs;
  if (adminScheduled && pending && publishAt) {
    remainingMs = Math.max(0, publishAt.getTime() - now.getTime());
  } else if (adminScheduled && validUntil) {
    remainingMs = Math.max(0, validUntil.getTime() - now.getTime());
  } else {
    remainingMs = getTimeRemainingMs();
  }

  sendSuccess(res, {
    session,
    streak: {
      currentStreak: streak.currentStreak,
      streakPoints: streak.streakPoints,
      todaySolved: streak.todaySolved,
      isCatchUp: mode === 'catchup',
    },
    timeRemaining: formatCountdown(remainingMs),
  }, 'Daily challenge started', 201);
});

export const startSession = asyncHandler(async (req, res) => {
  const { language, difficulty, slug } = req.body;
  if (!language) throw new AppError('Language is required', 400);

  let problem;
  if (slug) {
    problem = getProblemBySlug(slug);
    if (!problem) throw new AppError('Problem not found', 404);
  } else {
    const pool = getProblemsByDifficulty(difficulty);
    problem = pool[Math.floor(Math.random() * pool.length)] || PROBLEMS[0];
  }

  const session = await CodingSession.create({
    userId: req.user._id,
    language,
    mode: 'practice',
    problemSlug: problem.slug,
    problem: createSessionPayload(problem, language),
    code: getStarterCode(problem, language),
  });

  sendSuccess(res, session, 'Coding session started', 201);
});

export const runCode = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const session = await CodingSession.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) throw new AppError('Session not found', 404);

  const problem = getProblemBySlug(session.problemSlug);
  if (!problem) throw new AppError('Problem data not found', 404);

  const runResults = await runCodeAsync(session.language, code || session.code, problem);
  session.code = code || session.code;
  session.runResults = runResults;
  await session.save();

  sendSuccess(res, runResults, runResults.allPassed ? 'All test cases passed!' : `${runResults.passed}/${runResults.total} passed`);
});

export const submitCode = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const session = await CodingSession.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) throw new AppError('Session not found', 404);

  const problem = getProblemBySlug(session.problemSlug);
  if (!problem) throw new AppError('Problem data not found', 404);

  session.code = code || session.code;
  const runResults = await runCodeAsync(session.language, session.code, problem);
  session.runResults = runResults;

  let feedback;
  try {
    feedback = await reviewCode(session.code, session.language, session.problem.description);
    if (!feedback || typeof feedback !== 'object') {
      feedback = buildLocalFeedback(runResults);
    }
  } catch (err) {
    console.error('Code review fallback:', err.message);
    feedback = buildLocalFeedback(runResults);
  }

  if (runResults.allPassed) {
    feedback.correctness = 100;
    feedback.score = Math.max(feedback.score || 0, 85);
  } else if (runResults.total > 0) {
    feedback.correctness = Math.round((runResults.passed / runResults.total) * 100);
    feedback.score = Math.min(feedback.score || 50, feedback.correctness);
  } else {
    feedback = buildLocalFeedback(runResults);
    if (runResults.error) {
      feedback.suggestions = [runResults.error];
    }
  }

  session.feedback = feedback;
  session.status = 'submitted';
  session.submittedAt = new Date();
  await session.save();

  let streakResult = null;
  let xpEarned = 0;
  const xpBefore = (await User.findById(req.user._id).select('stats'))?.stats?.xp ?? 0;

  if (runResults.allPassed && (session.mode === 'streak' || session.mode === 'catchup')) {
    try {
      streakResult = await completeDailyChallenge(req.user._id, session.problemSlug, {
        isCatchUp: session.mode === 'catchup',
        catchUpDate: session.catchUpDate,
        language: session.language,
        problemTitle: session.problem.title,
      });
    } catch (err) {
      console.error('Streak update error:', err.message);
    }
  } else if (runResults.allPassed) {
    try {
      await markProblemSolved(req.user._id, session.problemSlug);
    } catch (err) {
      console.error('Mark solved error:', err.message);
    }
  }

  if (runResults.allPassed) {
    try {
      await syncCodingXp(req.user._id);
      const xpAfter = (await User.findById(req.user._id).select('stats'))?.stats?.xp ?? 0;
      xpEarned = Math.max(0, xpAfter - xpBefore);
    } catch (err) {
      console.error('XP sync error:', err.message);
    }
  }

  sendSuccess(res, {
    session,
    runResults,
    streak: streakResult?.streak,
    reward: streakResult?.reward,
    certificate: streakResult?.certificate,
    xpEarned,
  }, runResults.allPassed ? 'Accepted! All tests passed.' : 'Wrong Answer — fix and try again');
});

export const getCertificates = asyncHandler(async (req, res) => {
  const certs = await Certificate.find({ userId: req.user._id }).sort({ earnedAt: -1 });
  sendSuccess(res, certs);
});

export const getCertificateHtml = asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({ _id: req.params.id, userId: req.user._id });
  if (!cert) throw new AppError('Certificate not found', 404);
  const user = await User.findById(req.user._id);
  const html = buildCertificateHtml(cert, user);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await CodingSession.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(30);
  sendSuccess(res, sessions);
});

export const getSession = asyncHandler(async (req, res) => {
  const session = await CodingSession.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) throw new AppError('Session not found', 404);
  sendSuccess(res, session);
});
