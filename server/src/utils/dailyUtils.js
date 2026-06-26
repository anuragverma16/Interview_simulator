export function todayStr(date = new Date()) {
  return date.toISOString().split('T')[0];
}

export function yesterdayStr(date = new Date()) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}

export function hashDate(dateStr) {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = (Math.imul(31, h) + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getNextResetAt(date = new Date()) {
  const next = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return next.toISOString();
}

export function getTimeRemainingMs(date = new Date()) {
  const next = new Date(getNextResetAt(date));
  return Math.max(0, next.getTime() - date.getTime());
}

export function formatCountdown(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return {
    hours: h,
    minutes: m,
    seconds: sec,
    label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`,
  };
}

export const POINTS = {
  DAILY_ON_TIME: 5,
  DAILY_MISSED_PENALTY: 2,
  CATCH_UP_REWARD: 5,
  STREAK_BONUS_PER_DAY: 0,
};

/** XP awarded per accepted solve (same values added to streak points for daily). */
export const CODING_XP = {
  DAILY: 5,
  PRACTICE: 1,
};

export function calculateDailyReward(isCatchUp, _streakDays) {
  const points = isCatchUp ? POINTS.CATCH_UP_REWARD : POINTS.DAILY_ON_TIME;
  return { points, penalty: isCatchUp ? POINTS.DAILY_MISSED_PENALTY : 0 };
}

/** Build day statuses map shared by calendar builders. */
function buildStreakStatusMaps(streak) {
  const today = todayStr();
  const solvedMap = new Map();
  for (const h of streak.streakHistory || []) {
    if (h.solved) solvedMap.set(h.date, h.catchUp ? 'catchup' : 'solved');
  }
  const missedSet = new Set(
    (streak.missedChallenges || []).filter((m) => !m.solved).map((m) => m.date)
  );
  const freezeSet = new Set(streak.freezeUsedDates || []);
  return { today, solvedMap, missedSet, freezeSet };
}

function resolveDayStatus(date, streak, maps) {
  const { today, solvedMap, missedSet, freezeSet } = maps;
  if (solvedMap.has(date)) return solvedMap.get(date);
  if (freezeSet.has(date)) return 'freeze';
  if (missedSet.has(date)) return 'missed';
  if (date === today && streak.lastSolvedDate !== today) return 'pending';
  return 'empty';
}

/** Last N days of streak activity for profile heatmap (default ~2 months). */
export function buildStreakCalendar(streak, totalDays = 60) {
  const maps = buildStreakStatusMaps(streak);
  const days = [];
  const end = new Date(`${maps.today}T12:00:00Z`);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (totalDays - 1));

  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const date = d.toISOString().split('T')[0];
    days.push({
      date,
      status: resolveDayStatus(date, streak, maps),
      day: d.getUTCDate(),
      month: d.getUTCMonth(),
      year: d.getUTCFullYear(),
      weekday: d.getUTCDay(),
    });
  }
  return days;
}

/** Full calendar for a specific month (month is 1–12). */
export function buildStreakCalendarForMonth(streak, year, month) {
  const maps = buildStreakStatusMaps(streak);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const d = new Date(`${date}T12:00:00Z`);
    days.push({
      date,
      status: resolveDayStatus(date, streak, maps),
      day,
      month: month - 1,
      year,
      weekday: d.getUTCDay(),
    });
  }

  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const solved = days.filter((d) => d.status === 'solved' || d.status === 'catchup').length;
  const missed = days.filter((d) => d.status === 'missed').length;

  return {
    days,
    firstWeekday,
    daysInMonth,
    year,
    month,
    monthStats: { solved, missed, totalDays: daysInMonth },
  };
}

/** Years/months available for the streak calendar picker. */
export function getStreakCalendarMeta(streak) {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;

  const dateStrings = [
    ...(streak.streakHistory || []).map((h) => h.date),
    ...(streak.missedChallenges || []).map((m) => m.date),
    ...(streak.freezeUsedDates || []),
    todayStr(),
  ].filter(Boolean);

  let minYear = currentYear;
  if (dateStrings.length) {
    minYear = Math.min(...dateStrings.map((d) => parseInt(d.slice(0, 4), 10)));
  }

  const years = [];
  for (let y = minYear; y <= currentYear; y++) years.push(y);

  return { years, currentYear, currentMonth, minYear };
}
