export const STREAK_MILESTONES = [50, 100, 200, 250];

export const MILESTONE_META = {
  50: {
    title: '50-Day Streak Champion',
    description: 'Maintain a 50-day coding streak',
    icon: '🥉',
    xpReward: 250,
    badgeClass: 'from-amber-700/30 to-amber-900/20 border-amber-600/40',
  },
  100: {
    title: '100-Day Century Coder',
    description: 'Maintain a 100-day coding streak',
    icon: '🥈',
    xpReward: 500,
    badgeClass: 'from-slate-400/25 to-slate-600/15 border-slate-400/40',
  },
  200: {
    title: '200-Day Dedication Badge',
    description: 'Maintain a 200-day coding streak',
    icon: '🥇',
    xpReward: 1000,
    badgeClass: 'from-yellow-500/25 to-amber-600/15 border-yellow-500/45',
  },
  250: {
    title: '250-Day Legend',
    description: 'Maintain a 250-day coding streak',
    icon: '👑',
    xpReward: 1500,
    badgeClass: 'from-purple-500/25 to-pink-500/15 border-purple-400/45',
  },
};

export const MILESTONE_ACHIEVEMENTS = STREAK_MILESTONES.map((day) => ({
  key: `streak_${day}`,
  title: MILESTONE_META[day].title,
  description: MILESTONE_META[day].description,
  icon: MILESTONE_META[day].icon,
  category: 'streak',
  xpReward: MILESTONE_META[day].xpReward,
  criteria: { type: 'streak', threshold: day },
}));
