import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, AlertTriangle, Trophy, Zap } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import type { CodingStreakData, MissedChallenge } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  streak: CodingStreakData;
  onStartDaily: () => void;
  onStartCatchUp: (date: string) => void;
  loading?: boolean;
}

function useCountdown(initialMs: number, resetKey: string) {
  const [remaining, setRemaining] = useState(initialMs);

  useEffect(() => {
    setRemaining(initialMs);
    const tick = () => {
      setRemaining((prev) => Math.max(0, prev - 1000));
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [initialMs, resetKey]);

  const s = Math.floor(remaining / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  return { label, hours: h, minutes: m, seconds: sec };
}

function diffColor(d: string) {
  if (d === 'easy') return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
  if (d === 'medium') return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
  return 'text-red-400 bg-red-500/20 border-red-500/30';
}

function MissedCard({
  miss,
  onSolve,
  loading,
}: {
  miss: MissedChallenge;
  onSolve: () => void;
  loading?: boolean;
}) {
  const prob = miss.problem;
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span className="text-xs text-amber-400 font-semibold">MISSED · {miss.date}</span>
          {prob && (
            <span className={cn('text-xs px-2 py-0.5 rounded-full border capitalize', diffColor(prob.difficulty))}>
              {prob.difficulty}
            </span>
          )}
        </div>
        <p className="font-medium">{prob?.title || miss.problemSlug}</p>
        <p className="text-xs text-white/40 mt-1">
          Catch-up: +5 XP · streak stays at 0 until you solve today&apos;s problem
        </p>
      </div>
      <Button size="sm" variant="secondary" onClick={onSolve} loading={loading}>
        Solve Catch-Up
      </Button>
    </div>
  );
}

export default function DailyStreakPanel({
  streak,
  onStartDaily,
  onStartCatchUp,
  loading,
}: Props) {
  const countdown = useCountdown(streak.timeRemainingMs, streak.nextResetAt);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card glow className="!p-6">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30"
            >
              <Flame className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <p className="text-3xl font-bold neon-text">{streak.currentStreak}</p>
              <p className="text-sm text-white/50">
                Day Streak
                {streak.currentStreak === 0 && streak.missedChallenges?.length > 0 && (
                  <span className="block text-xs text-amber-400/90 mt-0.5">Missed a day — solve today to restart</span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
              <p className="text-xl font-bold">{streak.longestStreak}</p>
              <p className="text-xs text-white/40">Best</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
              <p className="text-xl font-bold">{streak.streakPoints}</p>
              <p className="text-xs text-white/40">Streak XP</p>
              <p className="text-[10px] text-white/30 mt-0.5">5 per daily solve</p>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 p-4">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
              <Clock className="h-3.5 w-3.5" />
              {streak.dailyProblemPending ? 'Unlocks in' : streak.adminScheduledDaily ? 'Time left (24h)' : 'New problem in'}
            </div>
            <p className="text-3xl font-mono font-bold tracking-wider text-cyan-300">{countdown.label}</p>
            <p className="text-[10px] text-white/30 mt-2">
              {streak.adminScheduledDaily
                ? 'Admin daily · 24h window from publish time'
                : 'Resets at UTC midnight'} · {streak.totalProblems?.toLocaleString()}+ problems
            </p>
          </div>
        </Card>

        <div className="lg:col-span-2">
        {streak.dailyProblemPending ? (
          <Card className="!p-6 border-amber-500/25 bg-amber-500/5">
            <div className="text-center py-6">
              <Clock className="h-10 w-10 text-amber-400/70 mx-auto mb-3" />
              <p className="font-bold text-lg">Problem drops at {streak.dailyProblemPublishLabel || 'scheduled time'}</p>
              <p className="text-sm text-white/50 mt-2">
                {streak.scheduledProblemTitle ? `Coming up: ${streak.scheduledProblemTitle}` : 'Admin scheduled today\'s challenge'}
              </p>
              <p className="text-xs text-white/35 mt-3">You&apos;ll get a notification when it&apos;s live</p>
            </div>
          </Card>
        ) : streak.dailyProblemExpired ? (
          <Card className="!p-6 border-red-500/25 bg-red-500/5">
            <div className="text-center py-6">
              <AlertTriangle className="h-10 w-10 text-red-400/70 mx-auto mb-3" />
              <p className="font-bold text-lg">24-hour window ended</p>
              <p className="text-sm text-white/50 mt-2">
                {streak.scheduledProblemTitle
                  ? `"${streak.scheduledProblemTitle}" was today's admin challenge`
                  : 'Today\'s admin challenge has expired'}
              </p>
              <p className="text-xs text-white/35 mt-3">Check missed challenges below to catch up</p>
            </div>
          </Card>
        ) : streak.todayProblem ? (
        <div
          className={cn(!streak.todaySolved && 'cursor-pointer')}
          onClick={!streak.todaySolved ? onStartDaily : undefined}
          role={!streak.todaySolved ? 'button' : undefined}
          tabIndex={!streak.todaySolved ? 0 : undefined}
          onKeyDown={!streak.todaySolved ? (e) => e.key === 'Enter' && onStartDaily() : undefined}
        >
        <Card className="lg:col-span-2 !p-6 hover:border-orange-500/40 transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-400">PROBLEM OF THE DAY</span>
              <span className="text-xs text-white/30">· {streak.dailyDate}</span>
            </div>
            <span className={cn('text-xs px-2 py-0.5 rounded-full border capitalize', diffColor(streak.todayProblem.difficulty))}>
              {streak.todayProblem.difficulty}
            </span>
          </div>

          <h2 className="text-xl font-bold mb-2">#{streak.todayProblem.leetcodeId} {streak.todayProblem.title}</h2>
          <p className="text-sm text-white/50 mb-4 line-clamp-3">{streak.todayProblem.description}</p>

          <div className="flex flex-wrap gap-1 mb-4">
            {streak.todayProblem.tags?.slice(0, 4).map((t) => (
              <span key={t} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-white/40">{t}</span>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Button
              onClick={(e) => { e.stopPropagation(); onStartDaily(); }}
              loading={loading}
              disabled={streak.todaySolved}
              size="lg"
              variant={streak.todaySolved ? 'secondary' : 'primary'}
            >
              <Flame className="h-5 w-5" />
              {streak.todaySolved ? 'Completed Today ✓' : 'Open Problem of the Day'}
            </Button>
            {!streak.todaySolved && (
              <span className="text-xs text-white/40 flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-400" />
                +5 XP on-time solve
              </span>
            )}
          </div>
        </Card>
        </div>
        ) : null}
        </div>
      </div>

      {streak.missedChallenges && streak.missedChallenges.length > 0 && (
        <Card className="!p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Missed Challenges
            <span className="text-xs text-white/40 font-normal">— solve with reduced points</span>
          </h3>
          <div className="space-y-3">
            {streak.missedChallenges.map((m) => (
              <MissedCard
                key={m.date}
                miss={m}
                onSolve={() => onStartCatchUp(m.date)}
                loading={loading}
              />
            ))}
          </div>
        </Card>
      )}

      {streak.certificates && streak.certificates.length > 0 && (
        <Card className="!p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-amber-400" />
            Your Certificates
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {streak.certificates.map((c) => (
              <a
                key={c._id}
                href={`/api/v1/coding/certificates/${c._id}/html`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 hover:border-purple-500/40 transition-colors"
              >
                <p className="text-xs text-purple-400 mb-1">Day {c.streakDay} Streak</p>
                <p className="font-medium text-sm truncate">{c.problemTitle}</p>
                <p className="text-[10px] text-white/30 mt-2 font-mono">{c.certId}</p>
              </a>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
