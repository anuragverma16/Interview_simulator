import type { CodingStreakData } from '../types';

export interface AppNotification {
  id: string;
  type: 'daily_streak' | 'missed_streak' | 'admin_message';
  title: string;
  message: string;
  expiresAt: string;
  actionUrl: string;
  actionLabel: string;
  read?: boolean;
  dismissed?: boolean;
  fromAdminName?: string;
  kind?: 'general' | 'daily_problem';
}

export interface UserNotificationRecord {
  _id: string;
  title: string;
  message: string;
  actionUrl: string;
  actionLabel: string;
  expiresAt: string;
  read: boolean;
  dismissed?: boolean;
  kind?: 'general' | 'daily_problem';
  createdAt: string;
  fromAdminId?: { name: string };
}

export function mapUserNotifications(records: UserNotificationRecord[]): AppNotification[] {
  const now = Date.now();
  return records
    .filter((n) => !n.dismissed && new Date(n.expiresAt).getTime() > now)
    .map((n) => ({
      id: `admin-${n._id}`,
      type: 'admin_message' as const,
      title: n.title,
      message: n.message,
      expiresAt: n.expiresAt,
      actionUrl: n.actionUrl || '/dashboard',
      actionLabel: n.actionLabel || 'Open',
      read: n.read,
      dismissed: n.dismissed,
      fromAdminName: n.fromAdminId?.name,
      kind: n.kind || 'general',
    }));
}

export function buildNotifications(streak: CodingStreakData | null): AppNotification[] {
  if (!streak) return [];

  const now = Date.now();
  const items: AppNotification[] = [];

  if (!streak.todaySolved && streak.nextResetAt && streak.todayProblem) {
    const expires = new Date(streak.nextResetAt).getTime();
    if (expires > now) {
      items.push({
        id: `daily-${streak.dailyDate}`,
        type: 'daily_streak',
        title: 'Daily problem not solved',
        message: streak.todayProblem?.title
          ? `Complete "${streak.todayProblem.title}" before the 24-hour timer ends.`
          : 'Complete today\'s coding streak before the timer resets.',
        expiresAt: streak.nextResetAt,
        actionUrl: '/coding/daily?start=1',
        actionLabel: 'Solve now',
      });
    }
  }

  streak.missedChallenges?.filter((m) => !m.solved).forEach((m) => {
    const expires = streak.nextResetAt;
    if (new Date(expires).getTime() > now) {
      items.push({
        id: `missed-${m.date}`,
        type: 'missed_streak',
        title: `Missed challenge · ${m.date}`,
        message: m.problem?.title
          ? `Catch up on "${m.problem.title}" for reduced points.`
          : 'Solve your missed daily challenge.',
        expiresAt: expires,
        actionUrl: '/coding/daily?start=1',
        actionLabel: 'Catch up',
      });
    }
  });

  return items.filter((n) => new Date(n.expiresAt).getTime() > now);
}

export function formatExpiresIn(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}

const DISMISSED_KEY = 'interviewiq-dismissed-notifications';

export function getDismissedNotificationIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function dismissNotificationIds(ids: string[]) {
  const next = getDismissedNotificationIds();
  ids.forEach((id) => next.add(id));
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
}

export function isNotificationUnread(n: AppNotification, dismissed: Set<string>): boolean {
  if (n.type === 'admin_message') return !n.read && !n.dismissed;
  return !dismissed.has(n.id);
}
