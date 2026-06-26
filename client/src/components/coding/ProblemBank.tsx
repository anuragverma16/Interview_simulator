import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronLeft, ChevronRight, CheckCircle2, Play, Sparkles, Clock } from 'lucide-react';
import { codingApi } from '../../services/api';
import type { LeetCodeProblem, ProblemTopic, ProblemsResponse, FeaturedPracticeProblem } from '../../types';
import { cn } from '../../utils/cn';

import { CODING_LANGUAGES } from '../../constants/languages';

const DIFFICULTIES = [
  { id: '', label: 'All', color: 'text-white/70' },
  { id: 'easy', label: 'Easy', color: 'text-emerald-400' },
  { id: 'medium', label: 'Medium', color: 'text-amber-400' },
  { id: 'hard', label: 'Hard', color: 'text-red-400' },
];

interface Props {
  language: string;
  onLanguageChange: (lang: string) => void;
  onSelectProblem: (slug: string) => void;
  solvedSlugs?: string[];
  refreshKey?: number;
  loading?: boolean;
}

export default function ProblemBank({ language, onLanguageChange, onSelectProblem, solvedSlugs = [], refreshKey = 0 }: Props) {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [topic, setTopic] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ProblemsResponse | null>(null);
  const [topics, setTopics] = useState<ProblemTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [localSolved, setLocalSolved] = useState<Set<string>>(new Set(solvedSlugs));
  const [featured, setFeatured] = useState<FeaturedPracticeProblem | null>(null);
  const [featuredRemaining, setFeaturedRemaining] = useState('');

  useEffect(() => {
    setLocalSolved(new Set(solvedSlugs));
  }, [solvedSlugs]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    codingApi.getTopics().then(({ data: res }) => setTopics(res.data)).catch(() => {});
  }, []);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await codingApi.getProblems({
        search: debouncedSearch || undefined,
        difficulty: difficulty || undefined,
        topic: topic || undefined,
        page,
        limit: 30,
        sort: 'leetcodeId',
      });
      setData(res.data);
      setFeatured(res.data.featuredPracticeProblem || null);
      if (res.data.featuredPracticeProblem) {
        const tr = res.data.featuredPracticeProblem.timeRemaining;
        setFeaturedRemaining(typeof tr === 'string' ? tr : (tr as { label?: string })?.label ?? '');
      }
      if (res.data.solvedSlugs?.length) {
        setLocalSolved(new Set(res.data.solvedSlugs));
      } else if (res.data.items?.length) {
        setLocalSolved(new Set(res.data.items.filter((p: LeetCodeProblem) => p.solved).map((p: LeetCodeProblem) => p.slug)));
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, difficulty, topic, page, refreshKey]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, difficulty, topic]);

  useEffect(() => {
    if (!featured?.remainingMs) return undefined;
    let ms = featured.remainingMs;
    const tick = () => {
      ms = Math.max(0, ms - 1000);
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setFeaturedRemaining(h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`);
      if (ms <= 0) setFeatured(null);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [featured?.slug, featured?.remainingMs]);

  const diffBadge = (d: string) => {
    if (d === 'easy') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (d === 'medium') return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-red-500/15 text-red-400 border-red-500/30';
  };

  return (
    <div className="space-y-5">
      {featured && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-500/35 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-4 sm:p-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                Admin pick · 24 hours only
              </div>
              <p className="font-semibold text-lg text-white">
                #{featured.leetcodeId} {featured.title}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={cn('text-xs px-2.5 py-1 rounded-full border capitalize font-medium', diffBadge(featured.difficulty))}>
                  {featured.difficulty}
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-200/80">
                  <Clock className="h-3.5 w-3.5" />
                  {featuredRemaining || featured.timeRemaining} left
                </span>
                {featured.solved && (
                  <span className="text-[10px] font-semibold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded">
                    Solved
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectProblem(featured.slug)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-100 font-medium text-sm hover:bg-amber-500/30 transition-colors shrink-0"
            >
              <Play className="h-4 w-4" />
              Solve now
            </button>
          </div>
        </motion.div>
      )}

      {/* Toolbar — search, language dropdown, difficulty */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by #70, 200, title, or topic..."
            className="w-full rounded-xl border-2 border-white/15 bg-[#12121a] pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>

        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="rounded-xl border-2 border-white/15 bg-[#12121a] px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 min-w-[150px] cursor-pointer"
          aria-label="Programming language"
        >
          {CODING_LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>

        <div className="flex gap-2 p-1 rounded-xl border border-white/15 bg-[#12121a] overflow-x-auto">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id || 'all'}
              onClick={() => setDifficulty(d.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                difficulty === d.id ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'
              )}
            >
              {d.label}
              {data?.difficulties && d.id && (
                <span className="ml-1 text-xs opacity-60">
                  ({data.difficulties[d.id as keyof typeof data.difficulties]})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-white/40 leading-relaxed">
        <span className="text-white/55">{data?.totalProblems?.toLocaleString() ?? '3,000+'} problems</span>
        {' · '}
        <span className="text-white/55">40 classic LeetCode #</span> (search <code className="text-purple-300/90">#70</code> or <code className="text-purple-300/90">70</code>)
        {' · '}
        <span>IQ-1000+ are extra practice variants</span>
        {debouncedSearch && data?.total != null && (
          <span> · {data.total} match{data.total === 1 ? '' : 'es'}</span>
        )}
      </p>

      {/* Topic chips — all data structures */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-white/40" />
          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Topics & Data Structures</span>
        </div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setTopic('')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              !topic ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white'
            )}
          >
            All ({data?.total ?? '…'})
          </motion.button>
          {topics.filter((t) => t.count > 0).map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTopic(topic === t.id ? '' : t.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1',
                topic === t.id
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white'
              )}
            >
              <span>{t.icon}</span>
              {t.label}
              <span className="opacity-50">({t.count})</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Problem table — LeetCode style */}
      <div className="rounded-2xl border border-white/15 bg-[#12121a]/80 overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/10 text-xs font-semibold text-white/40 uppercase tracking-wider">
          <div className="col-span-1">Status</div>
          <div className="col-span-1">#</div>
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2">Acceptance</div>
          <div className="col-span-1" />
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {data?.items.map((p: LeetCodeProblem, i) => {
              const solved = Boolean(p.solved || localSolved.has(p.slug) || solvedSlugs.includes(p.slug));
              return (
                <motion.div
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.03 }}
                  className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center px-5 py-4 border-b border-white/5 hover:bg-purple-500/5 transition-colors cursor-pointer"
                  onClick={() => onSelectProblem(p.slug)}
                >
                  <div className="col-span-1 flex sm:justify-center" title={solved ? 'Solved' : 'Unsolved'}>
                    {solved ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-label="Solved" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-white/20 group-hover:border-purple-400/50 transition-colors" aria-label="Unsolved" />
                    )}
                  </div>
                  <div className="col-span-1 text-sm text-white/40 font-mono">
                    {p.generated ? `IQ-${p.leetcodeId}` : p.leetcodeId}
                  </div>
                  <div className="col-span-5">
                    <p className="font-medium text-sm group-hover:text-purple-300 transition-colors flex items-center gap-2 flex-wrap">
                      {p.title}
                      {solved && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded">
                          Solved
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1 sm:hidden">
                      {p.tags?.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className={cn('text-xs px-2.5 py-1 rounded-full border capitalize font-medium', diffBadge(p.difficulty))}>
                      {p.difficulty}
                    </span>
                  </div>
                  <div className="col-span-2 text-sm text-white/40">
                    {p.acceptance ? `${p.acceptance}%` : '—'}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <motion.span
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/0 group-hover:bg-purple-500/20 text-purple-400 opacity-0 group-hover:opacity-100 transition-all"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Play className="h-4 w-4" />
                    </motion.span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {!loading && data?.items.length === 0 && (
          <div className="p-12 text-center text-white/40">
            <p className="text-lg mb-2">No problems found</p>
            {/^#\s*\d+$/.test(search.trim()) || /^\d+$/.test(search.trim()) ? (
              <p className="text-sm max-w-md mx-auto">
                Problem #{search.replace(/^#\s*/, '')} is not in our classic LeetCode set yet.
                Clear the search to browse all {data?.totalProblems?.toLocaleString() ?? '3,000+'} practice problems,
                or search by title (e.g. &quot;two sum&quot;, &quot;binary search&quot;).
              </p>
            ) : (
              <p className="text-sm">Try adjusting your search or filters</p>
            )}
          </div>
        )}

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
            <p className="text-sm text-white/40">
              Showing {(page - 1) * data.limit + 1}–{Math.min(page * data.limit, data.total)} of {data.total}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/15 text-sm disabled:opacity-30 hover:bg-white/5 transition-all"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <span className="flex items-center px-3 text-sm text-white/50">
                {page} / {data.pages}
              </span>
              <button
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/15 text-sm disabled:opacity-30 hover:bg-white/5 transition-all"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
