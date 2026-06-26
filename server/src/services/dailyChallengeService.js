import User from '../models/User.js';
import { resolveDailyProblemForDateStr } from './dailyProblemService.js';
import { todayStr, yesterdayStr, POINTS } from '../utils/dailyUtils.js';

export function getMissedDates(streak) {
  if (!streak.missedChallenges?.length) return [];
  return streak.missedChallenges.filter((m) => !m.solved);
}

export async function syncUserStreakStat(userId, currentStreak) {
  const user = await User.findById(userId);
  if (!user) return;
  if (user.stats.streak !== currentStreak) {
    user.stats.streak = currentStreak;
    await user.save();
  }
}

export function syncStreakPoints(streak) {
  streak.streakPoints = streak.currentStreak * POINTS.DAILY_ON_TIME;
}

export async function breakStreak(streak) {
  const today = todayStr();
  const hadStreak = streak.currentStreak > 0;
  streak.currentStreak = 0;
  syncStreakPoints(streak);
  if (streak.lastSolvedDate !== today) {
    streak.todaySolved = false;
  }
  await syncUserStreakStat(streak.userId, 0);
  return hadStreak || streak.lastSolvedDate !== today;
}

/** If the user missed any calendar day, reset streak to 0 and record missed challenges. */
export async function syncMissedDays(streak) {
  const today = todayStr();
  const yesterday = yesterdayStr();
  let dirty = false;

  if (streak.lastSolvedDate !== today && streak.todaySolved) {
    streak.todaySolved = false;
    dirty = true;
  }

  if (streak.lastSolvedDate === today) {
    if (dirty) await streak.save();
    return streak;
  }

  if (streak.lastSolvedDate && streak.lastSolvedDate < yesterday) {
    let d = new Date(streak.lastSolvedDate + 'T12:00:00Z');
    const y = new Date(yesterday + 'T12:00:00Z');
    while (d < y) {
      d.setUTCDate(d.getUTCDate() + 1);
      const missDate = d.toISOString().split('T')[0];
      const exists = streak.missedChallenges.some((m) => m.date === missDate);
      if (!exists) {
        const prob = await resolveDailyProblemForDateStr(missDate);
        streak.missedChallenges.push({
          date: missDate,
          problemSlug: prob.slug,
          solved: false,
          pointsLost: POINTS.DAILY_MISSED_PENALTY,
        });
        dirty = true;
      }
    }
    if (await breakStreak(streak)) dirty = true;
  } else if (!streak.lastSolvedDate && streak.currentStreak > 0) {
    if (await breakStreak(streak)) dirty = true;
  }

  syncStreakPoints(streak);
  if (dirty || streak.isModified('streakPoints')) {
    await streak.save();
  }
  return streak;
}
