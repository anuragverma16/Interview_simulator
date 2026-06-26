import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic, Code2, FileText, Target, Briefcase, Map, Award, History, ArrowRight, Loader2, CheckCircle2,
} from 'lucide-react';
import { dashboardApi } from '../../services/api';
import Card from '../ui/Card';
import type { ActivityHistoryItem } from '../../types';
import { formatDate } from '../../utils/cn';
import { cn } from '../../utils/cn';

const TYPE_META: Record<
  ActivityHistoryItem['type'],
  { icon: typeof Mic; color: string; label: string; box: string }
> = {
  interview: { icon: Mic, color: 'from-cyan-500 to-blue-500', label: 'Interview', box: 'border-cyan-500/20 bg-cyan-500/5' },
  coding: { icon: Code2, color: 'from-emerald-500 to-teal-500', label: 'Coding', box: 'border-emerald-500/20 bg-emerald-500/5' },
  resume: { icon: FileText, color: 'from-violet-500 to-purple-500', label: 'Resume', box: 'border-violet-500/20 bg-violet-500/5' },
  'skill-gap': { icon: Target, color: 'from-orange-500 to-amber-500', label: 'Skill Gap', box: 'border-orange-500/20 bg-orange-500/5' },
  career: { icon: Briefcase, color: 'from-pink-500 to-rose-500', label: 'Career', box: 'border-pink-500/20 bg-pink-500/5' },
  roadmap: { icon: Map, color: 'from-indigo-500 to-blue-600', label: 'Roadmap', box: 'border-indigo-500/20 bg-indigo-500/5' },
  certificate: { icon: Award, color: 'from-yellow-500 to-orange-500', label: 'Certificate', box: 'border-yellow-500/20 bg-yellow-500/5' },
};

function renderSubtitle(item: ActivityHistoryItem) {
  if (item.type === 'coding' && item.problemName) {
    const rest = item.subtitle.replace(`${item.problemName} · `, '');
    return (
      <p className="text-xs text-muted line-clamp-2 mt-1 flex-1">
        <span className="font-bold text-themed">{item.problemName}</span>
        {rest ? ` · ${rest}` : null}
      </p>
    );
  }
  return <p className="text-xs text-muted line-clamp-2 mt-1 flex-1">{item.subtitle}</p>;
}

function formatScore(item: ActivityHistoryItem) {
  if (item.score == null || item.score === '') return null;
  if (typeof item.score === 'number') {
    if (item.type === 'resume' || item.type === 'skill-gap' || item.type === 'career' || item.type === 'roadmap' || item.type === 'interview') {
      return `${item.score}%`;
    }
    if (item.type === 'certificate') return `Day ${item.score}`;
    if (item.type === 'coding') return `Score ${item.score}`;
  }
  return String(item.score);
}

export default function DashboardActivityHistory() {
  const [filter, setFilter] = useState('coding');
  const [items, setItems] = useState<ActivityHistoryItem[]>([]);
  const [filters, setFilters] = useState<{ id: string; label: string }[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);

  const loadHistory = useCallback((type: string) => {
    const isFirst = items.length === 0;
    if (isFirst) setInitialLoading(true);
    else setRefreshing(true);

    dashboardApi.getHistory({ type, limit: 12 })
      .then(({ data }) => {
        setItems(data.data.items);
        setTotal(data.data.total);
        if (data.data.filters?.length) setFilters(data.data.filters);
      })
      .catch(() => {
        if (isFirst) {
          setItems([]);
          setTotal(0);
        }
      })
      .finally(() => {
        setInitialLoading(false);
        setRefreshing(false);
      });
  }, [items.length]);

  useEffect(() => {
    loadHistory(filter);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const chipFilters = filters.length
    ? filters
    : [
        { id: 'all', label: 'All' },
        { id: 'interview', label: 'Interviews' },
        { id: 'coding', label: 'Coding' },
        { id: 'resume', label: 'Resume' },
        { id: 'skill-gap', label: 'Skill Gap' },
        { id: 'career', label: 'Career' },
        { id: 'roadmap', label: 'Roadmap' },
        { id: 'certificate', label: 'Certificates' },
      ];

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-purple-400" />
          <h3 className="font-semibold">Activity History</h3>
          {refreshing && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" />}
        </div>
        <span className="text-xs text-muted">{total} record{total !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {chipFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium border transition-colors duration-150',
              filter === f.id
                ? 'border-purple-500/50 bg-purple-500/15 text-purple-600 dark:text-purple-300'
                : 'border-themed text-muted hover:text-themed hover:border-purple-500/30'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {initialLoading ? (
        <div className="flex items-center justify-center py-12 text-muted">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading history…
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted text-center py-10">
          No activity yet for this filter. Start practicing to build your history!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item) => {
            const meta = TYPE_META[item.type];
            const Icon = meta.icon;
            const scoreText = formatScore(item);
            const isSuccess = item.status === 'success';

            return (
              <Link
                key={`${item.type}-${item.id}`}
                to={item.link}
                className={cn(
                  'flex flex-col rounded-xl border p-4 hover:border-purple-500/30 hover:shadow-sm transition-all duration-150 group min-h-[120px]',
                  meta.box
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className={cn('rounded-lg bg-gradient-to-br p-2 shrink-0', meta.color)}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-themed text-muted">
                    {meta.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-themed leading-snug flex items-start gap-1.5">
                  {isSuccess && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />}
                  <span className="line-clamp-2">{item.title}</span>
                </p>
                {renderSubtitle(item)}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-themed/50">
                  <p className="text-[10px] text-muted">{formatDate(item.createdAt)}</p>
                  <div className="flex items-center gap-2">
                    {scoreText && (
                      <span className="text-xs font-semibold text-purple-500 dark:text-purple-300">{scoreText}</span>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-muted opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
