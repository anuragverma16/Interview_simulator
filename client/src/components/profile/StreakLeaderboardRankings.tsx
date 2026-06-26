import { useEffect, useState } from 'react';
import { Flame, Trophy, Loader2 } from 'lucide-react';
import { dashboardApi } from '../../services/api';
import Card from '../ui/Card';
import { avatarUrl } from '../../utils/avatar';
import { cn } from '../../utils/cn';
import type { StreakLeaderboardEntry } from '../../types';

export default function StreakLeaderboardRankings() {
  const [entries, setEntries] = useState<StreakLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.streakLeaderboard()
      .then(({ data }) => setEntries(data.data))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="!p-4 sm:!p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold text-themed">Streak Rankings</h3>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-muted py-8">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading…
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">No streak data yet. Be the first to start!</p>
      ) : (
        <div className="space-y-2 flex-1">
          {entries.slice(0, 10).map((entry) => {
            const src = avatarUrl(entry.avatar);
            return (
              <div
                key={String(entry.userId)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                  entry.isCurrentUser
                    ? 'border-purple-500/40 bg-purple-500/10'
                    : 'border-themed bg-black/[0.02] dark:bg-white/[0.02]'
                )}
              >
                <span className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                  entry.rank === 1 && 'bg-amber-500/20 text-amber-500',
                  entry.rank === 2 && 'bg-slate-400/20 text-slate-400',
                  entry.rank === 3 && 'bg-orange-600/20 text-orange-500',
                  entry.rank > 3 && 'bg-white/5 text-muted'
                )}>
                  {entry.rank}
                </span>
                {src ? (
                  <img src={src} alt="" className="h-8 w-8 rounded-full object-cover border border-white/10 shrink-0" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-bold shrink-0">
                    {entry.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-themed truncate">
                    {entry.name}
                    {entry.isCurrentUser && <span className="text-purple-400 ml-1">(You)</span>}
                  </p>
                  <p className="text-[10px] text-muted">{entry.totalSolved} solved · {entry.streakPoints} pts</p>
                </div>
                <div className="flex items-center gap-1 text-orange-500 shrink-0">
                  <Flame className="h-4 w-4" />
                  <span className="text-sm font-bold">{entry.currentStreak}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
