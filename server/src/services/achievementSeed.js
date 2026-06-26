import Achievement from '../models/Achievement.js';
import { MILESTONE_ACHIEVEMENTS } from '../constants/streakMilestones.js';

const BASE_ACHIEVEMENTS = [
  { key: 'first_interview', title: 'First Steps', description: 'Complete your first mock interview', icon: '🎯', category: 'interview', xpReward: 50, criteria: { type: 'interviews', threshold: 1 } },
  { key: 'interview_pro', title: 'Interview Pro', description: 'Complete 10 mock interviews', icon: '🏅', category: 'interview', xpReward: 200, criteria: { type: 'interviews', threshold: 10 } },
  { key: 'xp_100', title: 'Rising Star', description: 'Earn 100 XP', icon: '⭐', category: 'special', xpReward: 25, criteria: { type: 'xp', threshold: 100 } },
  { key: 'xp_500', title: 'XP Master', description: 'Earn 500 XP', icon: '💎', category: 'special', xpReward: 100, criteria: { type: 'xp', threshold: 500 } },
  { key: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', category: 'streak', xpReward: 75, criteria: { type: 'streak', threshold: 7 } },
  ...MILESTONE_ACHIEVEMENTS,
  { key: 'level_5', title: 'Level Up', description: 'Reach level 5', icon: '🚀', category: 'learning', xpReward: 150, criteria: { type: 'level', threshold: 5 } },
  { key: 'coding_ninja', title: 'Coding Ninja', description: 'Submit 5 coding solutions', icon: '💻', category: 'coding', xpReward: 100, criteria: { type: 'coding', threshold: 5 } },
  { key: 'resume_master', title: 'Resume Master', description: 'Upload and analyze your resume', icon: '📄', category: 'learning', xpReward: 50, criteria: { type: 'resume', threshold: 1 } },
];

export async function ensureAchievements() {
  try {
    for (const a of BASE_ACHIEVEMENTS) {
      await Achievement.findOneAndUpdate({ key: a.key }, a, { upsert: true });
    }
  } catch (error) {
    console.warn('Achievement seed skipped:', error.message);
  }
}
