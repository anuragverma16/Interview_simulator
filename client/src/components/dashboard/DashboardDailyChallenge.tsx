import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Clock, ArrowRight, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { codingApi } from '../../services/api';
import { useLayoutOptional } from '../../contexts/LayoutContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import type { CodingStreakData } from '../../types';
import { cn } from '../../utils/cn';

function diffColor(d: string) {
  if (d === 'easy') return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  if (d === 'hard') return 'text-red-400 border-red-500/30 bg-red-500/10';
  return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
}

function countdownLabel(streak: CodingStreakData) {
  const tr = streak.timeRemaining;
  if (tr && typeof tr === 'object' && 'label' in tr) return tr.label;
  if (typeof tr === 'string') return tr;
  return '—';
}

export default function DashboardDailyChallenge() {
  const layout = useLayoutOptional();
  const [localStreak, setLocalStreak] = useState<CodingStreakData | null>(layout?.streakData ?? null);
  const [loading, setLoading] = useState(!layout?.streakData);

  useEffect(() => {
    if (layout?.streakData) {
      setLocalStreak(layout.streakData);
      setLoading(false);
      return;
    }
    setLoading(true);
    codingApi.getStreak()
      .then(({ data }) => setLocalStreak(data.data))
      .catch(() => setLocalStreak(null))
      .finally(() => setLoading(false));
  }, [layout?.streakData]);

  const streak = layout?.streakData ?? localStreak;

  if (loading) {
    return (
      <Card className="!p-6 border-orange-500/15 flex items-center justify-center gap-2 text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading today&apos;s problem…</span>
      </Card>
    );
  }

  if (!streak) {
    return (
      <Card className="!p-6 border-orange-500/15 text-center">
        <p className="text-sm text-muted">Could not load daily problem. Open Daily Streak to retry.</p>
        <Link to="/coding/daily" className="inline-block mt-3">
          <Button size="sm">Go to Daily Streak</Button>
        </Link>
      </Card>
    );
  }

  const pending = streak.dailyProblemPending;
  const expired = streak.dailyProblemExpired;
  const problem = streak.todayProblem;
  const timeLabel = countdownLabel(streak);

  return (
    <Card className="!p-0 overflow-hidden border-orange-500/20 bg-gradient-to-br from-orange-500/8 via-transparent to-amber-500/5">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-orange-500/15 bg-orange-500/5">
        <Flame className="h-4 w-4 text-orange-400" />
        <span className="text-sm font-semibold">Today&apos;s challenge snapshot</span>
        <span className="text-xs text-muted ml-auto">{streak.dailyDate}</span>
      </div>

      <div className="p-5">
        {pending ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
            <Lock className="h-9 w-9 text-amber-400/60 mx-auto mb-2" />
            <p className="font-semibold">New problem drops soon</p>
            <p className="text-sm text-muted mt-1">
              {streak.scheduledProblemTitle ? `"${streak.scheduledProblemTitle}"` : 'Admin scheduled challenge'}
            </p>
            {streak.dailyProblemPublishAt && (
              <p className="flex items-center justify-center gap-1.5 text-xs text-amber-400/80 mt-2">
                <Clock className="h-3.5 w-3.5" />
                Unlocks at {streak.dailyProblemPublishLabel || new Date(streak.dailyProblemPublishAt).toLocaleTimeString()}
              </p>
            )}
          </motion.div>
        ) : expired ? (
          <div className="text-center py-2">
            <AlertTriangle className="h-9 w-9 text-red-400/70 mx-auto mb-2" />
            <p className="font-semibold">24-hour window ended</p>
            <p className="text-sm text-muted mt-1">
              {streak.scheduledProblemTitle
                ? `"${streak.scheduledProblemTitle}" — catch up from Daily Streak`
                : 'Open Daily Streak for missed challenges'}
            </p>
            <Link to="/coding/daily" className="inline-block mt-3">
              <Button size="sm" variant="secondary">Daily Streak</Button>
            </Link>
          </div>
        ) : problem ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={cn('text-xs px-2 py-0.5 rounded-full border capitalize', diffColor(problem.difficulty))}>
                {problem.difficulty}
              </span>
              {streak.todaySolved && (
                <span className="text-xs text-emerald-400 font-medium">✓ Solved today</span>
              )}
              {streak.adminScheduledDaily && (
                <span className="text-xs text-amber-400/90">Admin pick · 24h</span>
              )}
            </div>
            <h3 className="text-lg font-bold mb-1">#{problem.leetcodeId} {problem.title}</h3>
            <p className="text-sm text-muted line-clamp-2 mb-4">{problem.description}</p>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-xs text-muted flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {timeLabel} left
              </p>
              <Link to="/coding/daily">
                <Button size="sm">
                  {streak.todaySolved ? 'Review' : 'Solve now'} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-2 text-sm text-muted">
            <p>No problem loaded for today yet.</p>
            <Link to="/coding/daily" className="inline-block mt-3">
              <Button size="sm">Open Daily Streak</Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}
