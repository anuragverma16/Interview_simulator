import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Clock, ArrowRight, Lock } from 'lucide-react';
import { codingApi } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FadeInUp from '../animations/FadeInUp';
import type { CodingStreakData } from '../../types';
import { cn } from '../../utils/cn';

function diffColor(d: string) {
  if (d === 'easy') return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  if (d === 'hard') return 'text-red-400 border-red-500/30 bg-red-500/10';
  return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
}

export default function DashboardDailyChallenge() {
  const [streak, setStreak] = useState<CodingStreakData | null>(null);

  useEffect(() => {
    codingApi.getStreak().then(({ data }) => setStreak(data.data)).catch(() => {});
  }, []);

  if (!streak) return null;

  const pending = streak.dailyProblemPending;
  const problem = streak.todayProblem;

  return (
    <FadeInUp delay={0.12}>
      <Card className="!p-0 overflow-hidden border-orange-500/20 bg-gradient-to-br from-orange-500/8 via-transparent to-amber-500/5">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-orange-500/15 bg-orange-500/5">
          <Flame className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-semibold">Problem of the day</span>
          <span className="text-xs text-muted ml-auto">{streak.dailyDate}</span>
        </div>

        <div className="p-5">
          {pending ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
              <Lock className="h-10 w-10 text-amber-400/60 mx-auto mb-3" />
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
          ) : problem ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={cn('text-xs px-2 py-0.5 rounded-full border capitalize', diffColor(problem.difficulty))}>
                  {problem.difficulty}
                </span>
                {streak.todaySolved && (
                  <span className="text-xs text-emerald-400 font-medium">✓ Solved today</span>
                )}
              </div>
              <h3 className="text-lg font-bold mb-1">#{problem.leetcodeId} {problem.title}</h3>
              <p className="text-sm text-muted line-clamp-2 mb-4">{problem.description}</p>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-muted flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {streak.timeRemaining?.label} left
                </p>
                <Link to="/coding/daily">
                  <Button size="sm">
                    {streak.todaySolved ? 'Review' : 'Solve now'} <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : null}
        </div>
      </Card>
    </FadeInUp>
  );
}
