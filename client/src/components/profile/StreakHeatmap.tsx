import { useMemo, useState } from 'react';
import { Flame, Snowflake, Trophy, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import type { StreakCalendarDay, StreakCalendarMeta } from '../../types';
import { cn } from '../../utils/cn';

const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  calendar: StreakCalendarDay[];
  meta: StreakCalendarMeta;
  currentStreak: number;
  longestStreak: number;
  streakFreezes?: number;
  onPeriodChange: (year: number, month: number) => void;
  loading?: boolean;
}

function statusLabel(status: StreakCalendarDay['status']) {
  switch (status) {
    case 'solved': return 'Daily problem solved';
    case 'catchup': return 'Catch-up solved';
    case 'missed': return 'Missed — no submission';
    case 'freeze': return 'Streak freeze used';
    case 'pending': return 'Today — not solved yet';
    default: return 'No submission';
  }
}

function formatDateLabel(date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS_FULL[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function cellStyles(status: StreakCalendarDay['status']) {
  switch (status) {
    case 'solved':
      return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-300';
    case 'catchup':
      return 'bg-emerald-500/10 border-emerald-400/35 text-emerald-600/80 dark:text-emerald-400/80';
    case 'freeze':
      return 'bg-cyan-500/15 border-cyan-400/40 text-cyan-600 dark:text-cyan-300';
    case 'missed':
      return 'bg-red-500/10 border-red-500/30 text-red-500/80 dark:text-red-400/80';
    case 'pending':
      return 'bg-orange-500/10 border-orange-500/40 text-orange-600 dark:text-orange-300 ring-1 ring-orange-500/25';
    default:
      return 'bg-black/[0.03] dark:bg-white/[0.03] border-themed text-muted';
  }
}

function dotClass(status: StreakCalendarDay['status']) {
  switch (status) {
    case 'solved': return 'bg-emerald-500';
    case 'catchup': return 'bg-emerald-400/70';
    case 'freeze': return 'bg-cyan-400';
    case 'missed': return 'bg-red-400/60';
    case 'pending': return 'bg-orange-400';
    default: return 'bg-white/20';
  }
}

function isFutureMonth(year: number, month: number, meta: StreakCalendarMeta) {
  if (year > meta.currentYear) return true;
  if (year === meta.currentYear && month > meta.currentMonth) return true;
  return false;
}

export default function StreakHeatmap({
  calendar,
  meta,
  currentStreak,
  longestStreak,
  streakFreezes = 0,
  onPeriodChange,
  loading = false,
}: Props) {
  const [hovered, setHovered] = useState<StreakCalendarDay | null>(null);
  const { selectedYear, selectedMonth, firstWeekday, monthStats } = meta;

  const grid = useMemo(() => {
    const cells: (StreakCalendarDay | null)[] = [
      ...Array(firstWeekday).fill(null),
      ...calendar,
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks: (StreakCalendarDay | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }, [calendar, firstWeekday]);

  const goMonth = (delta: number) => {
    let y = selectedYear;
    let m = selectedMonth + delta;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    if (y < meta.minYear || isFutureMonth(y, m, meta)) return;
    onPeriodChange(y, m);
  };

  const monthOptions = MONTHS_FULL.map((label, i) => ({
    value: i + 1,
    label,
    disabled: isFutureMonth(selectedYear, i + 1, meta),
  }));

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted font-medium">Current streak</p>
          <p className="text-2xl font-bold text-orange-500 flex items-center gap-1.5 mt-1">
            <Flame className="h-5 w-5" /> {currentStreak}
            <span className="text-xs font-normal text-muted">days</span>
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted font-medium">Max streak</p>
          <p className="text-2xl font-bold text-themed flex items-center gap-1.5 mt-1">
            <Trophy className="h-5 w-5 text-amber-500" /> {longestStreak}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted font-medium">This month</p>
          <p className="text-2xl font-bold text-emerald-500 mt-1">
            {monthStats.solved}
            <span className="text-sm font-normal text-muted"> / {monthStats.totalDays}</span>
          </p>
        </div>
        <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-transparent px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted font-medium">Streak freeze</p>
          <p className="text-2xl font-bold text-cyan-500 flex items-center gap-1.5 mt-1">
            <Snowflake className="h-5 w-5" /> {streakFreezes}
          </p>
        </div>
      </div>

      {/* Calendar card */}
      <div className={cn(
        'rounded-2xl border border-themed bg-gradient-to-b from-black/[0.02] to-transparent dark:from-white/[0.02] p-3 sm:p-4',
        loading && 'opacity-70 pointer-events-none'
      )}>
        {/* Month / year controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold text-themed hidden sm:block">Activity Calendar</h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              disabled={selectedYear === meta.minYear && selectedMonth === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-themed hover:bg-themed-hover disabled:opacity-30 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <select
              value={selectedMonth}
              onChange={(e) => onPeriodChange(selectedYear, parseInt(e.target.value, 10))}
              className="h-9 rounded-lg border border-themed bg-themed-elevated px-3 text-sm font-medium text-themed focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              aria-label="Select month"
            >
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value} disabled={m.disabled}>{m.label}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => onPeriodChange(parseInt(e.target.value, 10), selectedMonth)}
              className="h-9 rounded-lg border border-themed bg-themed-elevated px-3 text-sm font-medium text-themed focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              aria-label="Select year"
            >
              {meta.years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => goMonth(1)}
              disabled={selectedYear === meta.currentYear && selectedMonth === meta.currentMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-themed hover:bg-themed-hover disabled:opacity-30 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="text-center text-lg font-bold text-themed mb-4">
          {MONTHS_FULL[selectedMonth - 1]} {selectedYear}
        </p>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1.5">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center text-[10px] sm:text-xs font-semibold text-muted uppercase tracking-wide py-1">
              {w}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {grid.flat().map((day, i) => (
            day ? (
              <button
                key={day.date}
                type="button"
                onMouseEnter={() => setHovered(day)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(day)}
                onBlur={() => setHovered(null)}
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-lg border min-h-[36px] sm:min-h-[40px] p-0.5 transition-all hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-purple-500/40',
                  cellStyles(day.status)
                )}
              >
                <span className="text-xs sm:text-sm font-semibold">{day.day}</span>
                <span className={cn('mt-1 h-1.5 w-1.5 rounded-full', dotClass(day.status))} />
              </button>
            ) : (
              <span key={`empty-${i}`} className="min-h-[36px] sm:min-h-[40px]" />
            )
          ))}
        </div>

        {/* Hover detail */}
        <div className="mt-4 min-h-[52px]">
          {hovered ? (
            <div className="rounded-xl border border-themed bg-themed-elevated px-4 py-3 flex items-center gap-3">
              <span className={cn('h-3 w-3 rounded-full shrink-0', dotClass(hovered.status))} />
              <div>
                <p className="text-sm font-medium text-themed">{formatDateLabel(hovered.date)}</p>
                <p className="text-xs text-muted">{statusLabel(hovered.status)}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted text-center py-3">
              {monthStats.solved} solved · {monthStats.missed} missed · hover a day for details
            </p>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4 pt-4 border-t border-themed text-[11px] text-muted">
          {[
            { status: 'solved' as const, label: 'Solved' },
            { status: 'catchup' as const, label: 'Catch-up' },
            { status: 'empty' as const, label: 'No activity' },
            { status: 'missed' as const, label: 'Missed' },
            { status: 'freeze' as const, label: 'Freeze' },
            { status: 'pending' as const, label: 'Today' },
          ].map(({ status, label }) => (
            <span key={status} className="flex items-center gap-1.5">
              <span className={cn('h-2.5 w-2.5 rounded-full', dotClass(status))} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
