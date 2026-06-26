export function userInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export const NOTIFICATION_TEMPLATES = [
  {
    id: 'welcome',
    title: 'Welcome to InterviewIQ!',
    message: 'Your account is ready. Explore coding practice, AI interviews, and track your progress on the dashboard.',
    actionUrl: '/dashboard',
    actionLabel: 'Go to Dashboard',
  },
  {
    id: 'streak',
    title: 'Keep your streak alive!',
    message: 'You have not solved today\'s coding challenge yet. A few minutes of practice keeps your streak going.',
    actionUrl: '/coding',
    actionLabel: 'Practice Now',
  },
  {
    id: 'achievement',
    title: 'New milestone unlocked',
    message: 'Great work on your recent progress! Check your achievements page to see what you have earned.',
    actionUrl: '/achievements',
    actionLabel: 'View Achievements',
  },
  {
    id: 'feedback',
    title: 'We would love your feedback',
    message: 'How is your interview prep going? Reply to this message or update your profile so we can personalize your experience.',
    actionUrl: '/profile',
    actionLabel: 'Open Profile',
  },
] as const;

export function formatActionLabel(action: string) {
  return action
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
