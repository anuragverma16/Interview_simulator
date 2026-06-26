import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { codingApi } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StreakHeatmap from './StreakHeatmap';
import { useLayoutOptional } from '../../contexts/LayoutContext';
import type { CodingStreakData } from '../../types';

function currentPeriod() {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

export default function ProfileStreakBoard() {
  const layout = useLayoutOptional();
  const [streak, setStreak] = useState<CodingStreakData | null>(layout?.streakData ?? null);
  const [loading, setLoading] = useState(!layout?.streakData);

  const loadStreak = useCallback((y: number, m: number, soft = false) => {
    if (!soft) setLoading(true);
    codingApi.getStreak({ year: y, month: m })
      .then(({ data }) => {
        setStreak(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (layout?.streakData?.streakCalendar) {
      setStreak(layout.streakData);
      setLoading(false);
      return;
    }
    const { year: y, month: m } = currentPeriod();
    loadStreak(y, m);
  }, [layout?.streakData, loadStreak]);

  const handlePeriodChange = (y: number, m: number) => {
    loadStreak(y, m, true);
  };

  return (
    <Card glow className="!p-4 sm:!p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-muted">Daily coding submissions by month</p>
        {!streak?.todaySolved && (
          <Link to="/coding/daily">
            <Button size="sm">
              <span className="flex items-center gap-1.5">Solve today&apos;s streak</span>
            </Button>
          </Link>
        )}
      </div>

      {loading && !streak ? (
        <div className="flex items-center justify-center py-12 text-muted">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading calendar…
        </div>
      ) : streak?.streakCalendar && streak.streakCalendarMeta ? (
        <StreakHeatmap
          calendar={streak.streakCalendar}
          meta={streak.streakCalendarMeta}
          currentStreak={streak.currentStreak}
          longestStreak={streak.longestStreak}
          streakFreezes={streak.streakFreezes}
          onPeriodChange={handlePeriodChange}
          loading={loading}
        />
      ) : (
        <p className="text-sm text-muted text-center py-10">No streak data yet. Start your daily challenge!</p>
      )}
    </Card>
  );
}
