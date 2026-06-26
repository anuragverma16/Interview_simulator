import User from '../models/User.js';
import Resume from '../models/Resume.js';
import Interview from '../models/Interview.js';
import CodingSession from '../models/CodingSession.js';
import SkillGap from '../models/SkillGap.js';
import CareerPrediction from '../models/CareerPrediction.js';
import LearningRoadmap from '../models/LearningRoadmap.js';
import Certificate from '../models/Certificate.js';
import CodingStreak from '../models/CodingStreak.js';
import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';
import { STREAK_MILESTONES, MILESTONE_META } from '../constants/streakMilestones.js';
import { syncMilestoneCertificates } from '../services/certificateService.js';
import { checkAchievements, syncCodingXp } from '../services/achievementService.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/helpers.js';

const HISTORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'interview', label: 'Interviews' },
  { id: 'coding', label: 'Coding' },
  { id: 'resume', label: 'Resume' },
  { id: 'skill-gap', label: 'Skill Gap' },
  { id: 'career', label: 'Career' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'certificate', label: 'Certificates' },
];

function mapInterview(item) {
  const completed = item.status === 'completed';
  return {
    id: item._id,
    type: 'interview',
    title: completed ? 'Interview completed successfully' : 'Interview session',
    subtitle: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} · ${item.difficulty} · ${item.mode}`,
    score: item.analysis?.overallScore ?? null,
    status: completed ? 'success' : item.status,
    link: '/interview',
    createdAt: item.createdAt,
  };
}

function mapCoding(item) {
  const modeLabel = item.mode === 'streak' ? 'Daily streak' : item.mode === 'catchup' ? 'Catch-up' : 'Practice';
  const problemTitle = item.problem?.title || 'Coding problem';
  return {
    id: item._id,
    type: 'coding',
    title: 'Code submitted successfully',
    subtitle: `${modeLabel} · ${item.language}`,
    problemName: problemTitle,
    problemSlug: item.problemSlug,
    score: item.feedback?.score ?? null,
    status: 'success',
    link: item.mode === 'streak' || item.mode === 'catchup' ? '/coding/daily' : '/coding',
    createdAt: item.submittedAt || item.createdAt,
  };
}

function mapResume(item) {
  return {
    id: item._id,
    type: 'resume',
    title: 'Resume analyzed successfully',
    subtitle: item.fileName || `${item.parsed?.skills?.length || 0} skills detected`,
    score: item.analysis?.atsScore ?? item.analysis?.resumeScore ?? null,
    status: 'success',
    link: '/resume',
    createdAt: item.createdAt,
  };
}

function mapSkillGap(item) {
  return {
    id: item._id,
    type: 'skill-gap',
    title: 'Skill gap analyzed successfully',
    subtitle: `${item.targetRole} · ${item.matchedSkills?.length || 0} matched · ${item.missingSkills?.length || 0} missing`,
    score: item.matchPercentage ?? null,
    status: 'success',
    link: '/skill-gap',
    createdAt: item.createdAt,
  };
}

function mapCareer(item) {
  const topRole = item.careerMatches?.[0]?.role;
  return {
    id: item._id,
    type: 'career',
    title: 'Career prediction completed',
    subtitle: topRole ? `Top match: ${topRole}` : 'Placement readiness report',
    score: item.placementReadiness ?? null,
    status: 'success',
    link: '/career',
    createdAt: item.createdAt,
  };
}

function mapRoadmap(item) {
  return {
    id: item._id,
    type: 'roadmap',
    title: 'Learning roadmap created',
    subtitle: `${item.title || item.targetRole} · ${item.duration || 'Learning plan'}`,
    score: item.progress ?? null,
    status: 'active',
    link: '/roadmap',
    createdAt: item.createdAt,
  };
}

function mapCertificate(item) {
  return {
    id: item._id,
    type: 'certificate',
    title: 'Certificate earned successfully',
    subtitle: item.problemTitle ? `${item.problemTitle} · Day ${item.streakDay}` : `Streak day ${item.streakDay}`,
    score: item.streakDay ?? null,
    status: 'success',
    link: '/achievements',
    createdAt: item.earnedAt || item.createdAt,
  };
}

function dedupeCodingByProblem(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (item.type !== 'coding') return true;
    const key = item.problemSlug || item.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function limitCodingItems(items, max = 2) {
  let codingCount = 0;
  return items.filter((item) => {
    if (item.type !== 'coding') return true;
    codingCount += 1;
    return codingCount <= max;
  });
}

export const getActivityHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const type = String(req.query.type || 'all');
  const limit = Math.min(Math.max(parseInt(req.query.limit || '25', 10), 1), 50);
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const perSource = type === 'all' ? 12 : limit * 2;

  const tasks = [];

  if (type === 'all' || type === 'interview') {
    tasks.push(Interview.find({ userId }).sort({ createdAt: -1 }).limit(perSource).lean().then((rows) => rows.map(mapInterview)));
  }
  if (type === 'all' || type === 'coding') {
    tasks.push(
      CodingSession.find({
        userId,
        status: 'submitted',
        'runResults.allPassed': true,
      })
        .sort({ submittedAt: -1, createdAt: -1 })
        .limit(perSource)
        .lean()
        .then((rows) => rows.map(mapCoding))
    );
  }
  if (type === 'all' || type === 'resume') {
    tasks.push(Resume.find({ userId }).sort({ createdAt: -1 }).limit(perSource).lean().then((rows) => rows.map(mapResume)));
  }
  if (type === 'all' || type === 'skill-gap') {
    tasks.push(SkillGap.find({ userId }).sort({ createdAt: -1 }).limit(perSource).lean().then((rows) => rows.map(mapSkillGap)));
  }
  if (type === 'all' || type === 'career') {
    tasks.push(CareerPrediction.find({ userId }).sort({ createdAt: -1 }).limit(perSource).lean().then((rows) => rows.map(mapCareer)));
  }
  if (type === 'all' || type === 'roadmap') {
    tasks.push(LearningRoadmap.find({ userId }).sort({ createdAt: -1 }).limit(perSource).lean().then((rows) => rows.map(mapRoadmap)));
  }
  if (type === 'all' || type === 'certificate') {
    tasks.push(Certificate.find({ userId }).sort({ earnedAt: -1 }).limit(perSource).lean().then((rows) => rows.map(mapCertificate)));
  }

  const groups = await Promise.all(tasks);
  let merged = groups.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  merged = dedupeCodingByProblem(merged);
  if (type === 'all') {
    merged = limitCodingItems(merged, 2);
  }
  const total = merged.length;
  const start = (page - 1) * limit;
  const items = merged.slice(start, start + limit);

  sendSuccess(res, {
    items,
    total,
    page,
    limit,
    filters: HISTORY_FILTERS,
  });
});

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await syncCodingXp(userId);
  const freshUser = await User.findById(userId).select('stats');

  const [recentInterviews, recentCoding, resumes, userAchievements] = await Promise.all([
    Interview.find({ userId }).sort({ createdAt: -1 }).limit(5),
    CodingSession.find({ userId }).sort({ createdAt: -1 }).limit(5),
    Resume.find({ userId }).sort({ createdAt: -1 }).limit(3),
    UserAchievement.find({ userId }).populate('achievementId').sort({ unlockedAt: -1 }).limit(5),
  ]);

  const interviewScores = recentInterviews
    .filter((i) => i.status === 'completed')
    .map((i) => i.analysis?.overallScore || 0);

  const skillProgress = resumes[0]?.parsed?.skills?.slice(0, 8).map((skill, i) => ({
    skill,
    progress: Math.min(40 + i * 8 + Math.random() * 20, 95),
  })) || [];

  sendSuccess(res, {
    stats: freshUser?.stats || req.user.stats,
    recentInterviews,
    recentCoding,
    resumes,
    achievements: userAchievements,
    interviewScores,
    skillProgress,
    chartData: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      interviews: [2, 1, 3, 0, 2, 1, 4],
      scores: [72, 85, 68, 0, 90, 78, 82],
    },
  });
});

export const getLeaderboard = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    throw new AppError('Leaderboard is only available for user accounts', 403);
  }

  await syncCodingXp(req.user._id);

  const users = await User.find({ isActive: true, role: 'user' })
    .sort({ 'stats.xp': -1 })
    .limit(20)
    .select('name avatar stats');

  let leaderboard = users.map((u, i) => ({
    rank: i + 1,
    userId: u._id,
    name: u.name,
    avatar: u.avatar,
    xp: u.stats?.xp ?? 0,
    level: u.stats?.level ?? 1,
    isCurrentUser: String(u._id) === String(req.user._id),
  }));

  if (!leaderboard.some((e) => e.isCurrentUser)) {
    const me = await User.findById(req.user._id).select('name avatar stats role');
    if (me && me.role === 'user') {
      const rank = await User.countDocuments({
        isActive: true,
        role: 'user',
        'stats.xp': { $gt: me.stats?.xp ?? 0 },
      }) + 1;
      leaderboard.push({
        rank,
        userId: me._id,
        name: me.name,
        avatar: me.avatar,
        xp: me.stats?.xp ?? 0,
        level: me.stats?.level ?? 1,
        isCurrentUser: true,
      });
    }
  }

  sendSuccess(res, leaderboard);
});

export const getStreakLeaderboard = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    throw new AppError('Streak leaderboard is only available for user accounts', 403);
  }

  const streaks = await CodingStreak.find()
    .sort({ currentStreak: -1, streakPoints: -1, totalSolved: -1 })
    .limit(40)
    .populate('userId', 'name avatar role isActive')
    .lean();

  const leaderboard = streaks
    .filter((s) => s.userId && s.userId.role === 'user' && s.userId.isActive !== false)
    .slice(0, 25)
    .map((s, i) => ({
      rank: i + 1,
      userId: s.userId._id,
      name: s.userId.name,
      avatar: s.userId.avatar,
      currentStreak: s.currentStreak,
      longestStreak: s.longestStreak,
      streakPoints: s.streakPoints,
      totalSolved: s.totalSolved,
      isCurrentUser: String(s.userId._id) === String(req.user._id),
    }));

  const myEntry = leaderboard.find((e) => e.isCurrentUser);
  if (!myEntry) {
    const mine = await CodingStreak.findOne({ userId: req.user._id }).lean();
    if (mine) {
      leaderboard.push({
        rank: leaderboard.length + 1,
        userId: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar,
        currentStreak: mine.currentStreak,
        longestStreak: mine.longestStreak,
        streakPoints: mine.streakPoints,
        totalSolved: mine.totalSolved,
        isCurrentUser: true,
      });
    }
  }

  sendSuccess(res, leaderboard);
});

export const getAchievements = asyncHandler(async (req, res) => {
  const achievements = await Achievement.find();
  sendSuccess(res, achievements);
});

export const getUserAchievements = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const streak = await CodingStreak.findOne({ userId }).lean();

  await syncMilestoneCertificates(userId, {}, streak);
  await checkAchievements(userId);

  const [unlocked, all, certificates] = await Promise.all([
    UserAchievement.find({ userId }).populate('achievementId'),
    Achievement.find(),
    Certificate.find({ userId, type: 'milestone' }).sort({ streakDay: 1 }),
  ]);

  const bestStreak = Math.max(
    req.user.stats?.streak || 0,
    streak?.currentStreak || 0,
    streak?.longestStreak || 0
  );

  const milestoneBadges = STREAK_MILESTONES.map((day) => {
    const cert = certificates.find((c) => c.streakDay === day);
    const meta = MILESTONE_META[day];
    return {
      day,
      title: meta.title,
      description: meta.description,
      icon: meta.icon,
      earned: !!cert || bestStreak >= day,
      certificate: cert || null,
    };
  });

  sendSuccess(res, { unlocked, all, certificates, milestoneBadges });
});
