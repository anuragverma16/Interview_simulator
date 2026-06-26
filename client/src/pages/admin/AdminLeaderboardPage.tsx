import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Search, ChevronLeft, ChevronRight, Crown, Zap, Flame } from 'lucide-react';
import { adminApi } from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { AdminPage, AdminSection } from '../../components/admin/AdminMotion';
import { useAdminRefresh } from '../../contexts/AdminRefreshContext';
import { userInitials } from '../../components/admin/adminUtils';
import { avatarUrl } from '../../utils/avatar';
import { cn, formatDate } from '../../utils/cn';
import type { XpLeaderboardEntry, AdminLeaderboardResponse } from '../../types';
import toast from 'react-hot-toast';

const podiumStyles = [
  { ring: 'ring-amber-400/50', bg: 'from-amber-500/25 to-amber-600/5', text: 'text-amber-300', icon: Crown },
  { ring: 'ring-slate-300/40', bg: 'from-slate-400/20 to-slate-500/5', text: 'text-slate-200', icon: Trophy },
  { ring: 'ring-orange-500/40', bg: 'from-orange-600/20 to-orange-700/5', text: 'text-orange-300', icon: Trophy },
];

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold',
        rank === 1 && 'bg-amber-500/25 text-amber-300',
        rank === 2 && 'bg-slate-400/20 text-slate-300',
        rank === 3 && 'bg-orange-600/20 text-orange-400',
        rank > 3 && 'bg-white/5 text-white/50'
      )}
    >
      #{rank}
    </span>
  );
}

export default function AdminLeaderboardPage() {
  const navigate = useNavigate();
  const { refreshKey } = useAdminRefresh();
  const [items, setItems] = useState<XpLeaderboardEntry[]>([]);
  const [topThree, setTopThree] = useState<AdminLeaderboardResponse['topThree']>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const load = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const { data } = await adminApi.getLeaderboard({
        search: debouncedSearch || undefined,
        page: pageNum,
        limit: 20,
      });
      const res = data.data;
      setItems(res.items || []);
      setTopThree(res.topThree || []);
      setTotal(res.total || 0);
      setTotalUsers(res.totalUsers || 0);
      setPage(res.page || 1);
      setPages(res.pages || 1);
    } catch {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, refreshKey]);

  useEffect(() => {
    load(page);
  }, [load, page]);

  const podiumOrder = topThree.length >= 3 ? [topThree[1], topThree[0], topThree[2]] : topThree;

  return (
    <AdminPage className="space-y-6">
      {topThree.length > 0 && !debouncedSearch && page === 1 && (
        <AdminSection>
          <div className="admin-card admin-card-glow p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="h-5 w-5 text-amber-400" />
              <h3 className="font-bold">Top performers by XP</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              {podiumOrder.map((entry, i) => {
                const style = podiumStyles[i] ?? podiumStyles[2];
                const Icon = style.icon;
                const isFirst = entry.rank === 1;
                return (
                  <motion.button
                    key={String(entry.userId)}
                    type="button"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => navigate(`/admin/users/${entry.userId}`)}
                    className={cn(
                      'rounded-2xl border bg-gradient-to-b p-5 text-center transition-transform hover:scale-[1.02]',
                      style.ring,
                      style.bg,
                      isFirst ? 'sm:order-2 sm:-mt-2' : i === 0 ? 'sm:order-1' : 'sm:order-3'
                    )}
                  >
                    <div className={cn('mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ring-2', style.ring, style.bg)}>
                      {avatarUrl(entry.avatar) ? (
                        <img src={avatarUrl(entry.avatar)!} alt="" className="h-full w-full rounded-2xl object-cover" />
                      ) : (
                        <span className="text-lg font-bold">{userInitials(entry.name)}</span>
                      )}
                    </div>
                    <Icon className={cn('h-4 w-4 mx-auto mb-1', style.text)} />
                    <p className="font-semibold truncate">{entry.name}</p>
                    <p className={cn('text-2xl font-bold mt-1', style.text)}>#{entry.rank}</p>
                    <p className="text-sm text-white/55 mt-1">{entry.xp.toLocaleString()} XP</p>
                    <p className="text-xs text-white/35">Level {entry.level}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </AdminSection>
      )}

      <AdminSection delay={0.05}>
        <div className="admin-card admin-card-glow overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-amber-500/10">
            <div>
              <h3 className="font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                XP leaderboard
              </h3>
              <p className="text-xs text-white/40 mt-1">
                {totalUsers} users ranked by total XP
                {debouncedSearch && total !== totalUsers ? ` · ${total} match search` : ''}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto sm:min-w-[280px]">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email…"
                className="flex-1"
              />
              <Button variant="secondary" onClick={() => load(page)}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-white/35 border-b border-white/5">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">User</div>
            <div className="col-span-2">XP</div>
            <div className="col-span-1">Level</div>
            <div className="col-span-2">Streak</div>
            <div className="col-span-2">Status</div>
          </div>

          {loading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="p-12 text-center text-white/40 text-sm">No users found</p>
          ) : (
            <div className="divide-y divide-white/5">
              {items.map((entry, i) => (
                <motion.button
                  key={String(entry.userId)}
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => navigate(`/admin/users/${entry.userId}`)}
                  className="w-full grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 items-center px-5 py-4 text-left hover:bg-amber-500/[0.04] transition-colors"
                >
                  <div className="col-span-1">
                    <RankBadge rank={entry.rank} />
                  </div>
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    {avatarUrl(entry.avatar) ? (
                      <img src={avatarUrl(entry.avatar)!} alt="" className="h-10 w-10 rounded-xl object-cover border border-white/10 shrink-0" />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 flex items-center justify-center text-sm font-bold shrink-0">
                        {userInitials(entry.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{entry.name}</p>
                      <p className="text-xs text-white/40 truncate">{entry.email}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-bold text-amber-300">{entry.xp.toLocaleString()} XP</span>
                    <p className="text-[10px] text-white/35 md:hidden">{entry.totalSolved} solved</p>
                  </div>
                  <div className="col-span-1 text-sm text-white/60">Lv.{entry.level}</div>
                  <div className="col-span-2 flex items-center gap-1.5 text-sm">
                    <Flame className="h-4 w-4 text-orange-400 shrink-0" />
                    <span>{entry.currentStreak} day{entry.currentStreak === 1 ? '' : 's'}</span>
                    <span className="text-white/30 text-xs hidden lg:inline">· best {entry.longestStreak}</span>
                  </div>
                  <div className="col-span-2">
                    <span
                      className={cn(
                        'inline-block text-[10px] font-semibold uppercase px-2 py-1 rounded-full',
                        entry.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
                      )}
                    >
                      {entry.isActive ? 'Active' : 'Suspended'}
                    </span>
                    {entry.lastLogin && (
                      <p className="text-[10px] text-white/30 mt-1 hidden lg:block">
                        Last login {formatDate(entry.lastLogin)}
                      </p>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
              <p className="text-sm text-white/40">
                Page {page} of {pages} · {total} users
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <Button size="sm" variant="secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </AdminSection>
    </AdminPage>
  );
}
