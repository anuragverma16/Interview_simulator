import User from '../models/User.js';
import UserAchievement from '../models/UserAchievement.js';
import Achievement from '../models/Achievement.js';
import CodingStreak from '../models/CodingStreak.js';
import CodingSession from '../models/CodingSession.js';
import Resume from '../models/Resume.js';
import { CODING_XP } from '../utils/dailyUtils.js';

const XP_PER_LEVEL = 500;

export async function computeCodingXp(userId) {
  const sessions = await CodingSession.find({
    userId,
    status: 'submitted',
    'runResults.allPassed': true,
  }).select('mode problemSlug catchUpDate submittedAt').lean();

  const dailyKeys = new Set();
  const practiceSlugs = new Set();

  for (const s of sessions) {
    if (s.mode === 'streak') {
      const d = s.submittedAt ? new Date(s.submittedAt).toISOString().split('T')[0] : '';
      if (d) dailyKeys.add(d);
    } else if (s.mode === 'catchup' && s.catchUpDate) {
      dailyKeys.add(s.catchUpDate);
    } else if (s.mode === 'practice' && s.problemSlug) {
      practiceSlugs.add(s.problemSlug);
    }
  }

  return dailyKeys.size * CODING_XP.DAILY + practiceSlugs.size * CODING_XP.PRACTICE;
}

function applyLevel(stats) {
  stats.level = Math.max(1, Math.floor((stats.xp || 0) / XP_PER_LEVEL) + 1);
}

/** XP = coding solves only: 5 per daily/streak day, 2 per unique practice problem. */
export async function syncCodingXp(userId) {
  const user = await User.findById(userId);
  if (!user) return 0;

  const fromCoding = await computeCodingXp(userId);
  user.stats.xp = fromCoding;
  applyLevel(user.stats);
  await user.save();
  await checkAchievements(userId);
  return fromCoding;
}

export const addXP = async (userId, amount) => {
  if (!amount || amount <= 0) return;
  await syncCodingXp(userId);
};

export const checkAchievements = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const codingXp = await computeCodingXp(userId);
  const streakDoc = await CodingStreak.findOne({ userId }).lean();
  const bestStreak = Math.max(
    user.stats.streak || 0,
    streakDoc?.currentStreak || 0,
    streakDoc?.longestStreak || 0
  );

  const achievements = await Achievement.find();
  const unlockedIds = new Set(
    (await UserAchievement.find({ userId }).select('achievementId').lean())
      .map((row) => row.achievementId.toString())
  );

  const [resumeCount, codingPassedCount] = await Promise.all([
    Resume.countDocuments({ userId }),
    CodingSession.countDocuments({ userId, status: 'submitted', 'runResults.allPassed': true }),
  ]);

  for (const achievement of achievements) {
    if (unlockedIds.has(achievement._id.toString())) continue;

    let earned = false;
    const { type, threshold } = achievement.criteria || {};

    switch (type) {
      case 'interviews':
        earned = user.stats.totalInterviews >= (threshold || 1);
        break;
      case 'xp':
        earned = codingXp >= (threshold || 100);
        break;
      case 'streak':
        earned = bestStreak >= (threshold || 7);
        break;
      case 'level':
        earned = user.stats.level >= (threshold || 5);
        break;
      case 'resume':
        earned = resumeCount >= (threshold || 1);
        break;
      case 'coding':
        earned = codingPassedCount >= (threshold || 5);
        break;
      default:
        break;
    }

    if (earned) {
      try {
        await UserAchievement.create({ userId, achievementId: achievement._id });
        unlockedIds.add(achievement._id.toString());
      } catch (err) {
        if (err.code !== 11000) throw err;
      }
    }
  }
};

export const updateInterviewStats = async (userId, score) => {
  const user = await User.findById(userId);
  if (!user) return;

  const total = user.stats.totalInterviews;
  user.stats.avgScore = Math.round((user.stats.avgScore * total + score) / (total + 1));
  user.stats.totalInterviews = total + 1;
  user.stats.streak += 1;
  await user.save();
  await checkAchievements(userId);
};
