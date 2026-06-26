import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Code2, Send, Trash2, Zap, Search, Clock, ArrowRight } from 'lucide-react';
import { adminApi } from '../../services/api';
import Input, { Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { AdminPage, AdminSection } from '../../components/admin/AdminMotion';
import { useAdminRefresh } from '../../contexts/AdminRefreshContext';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

interface ScheduleRow {
  _id: string;
  scheduleDate: string;
  problemSlug: string;
  problemTitle?: string;
  problemDifficulty?: string;
  publishAt: string;
  validUntil?: string;
  endAt?: string;
  notificationSent: boolean;
  isPublished?: boolean;
  isLive?: boolean;
  isExpired?: boolean;
  isPending?: boolean;
  windowStatus?: 'pending' | 'live' | 'expired' | 'scheduled';
  remainingMs?: number;
  customTitle?: string;
}

interface ProblemPick {
  slug: string;
  title: string;
  difficulty: string;
  leetcodeId: number;
}

const WINDOW_MS = 24 * 60 * 60 * 1000;

function todayInput() {
  return new Date().toISOString().split('T')[0];
}

function utcDateTime(scheduleDate: string, time: string) {
  const [h, m] = time.split(':').map((v) => parseInt(v, 10) || 0);
  const d = new Date(`${scheduleDate}T00:00:00.000Z`);
  d.setUTCHours(h, m, 0, 0);
  return d;
}

function defaultEndFromPublish(scheduleDate: string, publishTime: string) {
  const publishAt = utcDateTime(scheduleDate, publishTime);
  const end = new Date(publishAt.getTime() + WINDOW_MS);
  return {
    endDate: end.toISOString().split('T')[0],
    endTime: `${String(end.getUTCHours()).padStart(2, '0')}:${String(end.getUTCMinutes()).padStart(2, '0')}`,
  };
}

function formatUtc(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }) + ' UTC';
}

function formatDuration(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h >= 24) {
    const days = Math.floor(h / 24);
    const rh = h % 24;
    return `${days}d ${rh}h`;
  }
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatRemaining(ms: number) {
  if (ms <= 0) return 'Ended';
  return `${formatDuration(ms)} left`;
}

function statusBadge(s: ScheduleRow) {
  const status = s.windowStatus
    || (s.isLive ? 'live' : s.isPending ? 'pending' : s.isExpired ? 'expired' : 'scheduled');
  const map = {
    live: { label: 'Live now', className: 'bg-emerald-500/15 text-emerald-300' },
    pending: { label: 'Scheduled', className: 'bg-amber-500/15 text-amber-300' },
    expired: { label: 'Ended', className: 'bg-red-500/15 text-red-300' },
    scheduled: { label: 'Scheduled', className: 'bg-white/10 text-white/50' },
  };
  const cfg = map[status] || map.scheduled;
  return (
    <span className={cn('inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full', cfg.className)}>
      {cfg.label}
    </span>
  );
}

export default function AdminDailyProblemPage() {
  const { refreshKey } = useAdminRefresh();
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [problems, setProblems] = useState<ProblemPick[]>([]);
  const [search, setSearch] = useState('');
  const [scheduleDate, setScheduleDate] = useState(todayInput());
  const [publishTime, setPublishTime] = useState('00:00');
  const [endDate, setEndDate] = useState(() => defaultEndFromPublish(todayInput(), '00:00').endDate);
  const [endTime, setEndTime] = useState(() => defaultEndFromPublish(todayInput(), '00:00').endTime);
  const [problemSlug, setProblemSlug] = useState('');
  const [customTitle, setCustomTitle] = useState('New daily problem is live!');
  const [saving, setSaving] = useState(false);
  const [autoEnd, setAutoEnd] = useState(true);

  const publishAt = useMemo(() => utcDateTime(scheduleDate, publishTime), [scheduleDate, publishTime]);
  const endAt = useMemo(() => utcDateTime(endDate, endTime), [endDate, endTime]);
  const windowMs = endAt.getTime() - publishAt.getTime();
  const windowValid = windowMs > 0;

  useEffect(() => {
    if (!autoEnd) return;
    const next = defaultEndFromPublish(scheduleDate, publishTime);
    setEndDate(next.endDate);
    setEndTime(next.endTime);
  }, [scheduleDate, publishTime, autoEnd]);

  const load = () => {
    adminApi.getDailyProblems().then(({ data }) => setSchedules(data.data || []));
    adminApi.getDailyProblemPicker({ search: search || undefined, limit: 50 })
      .then(({ data }) => setProblems(data.data || []));
  };

  useEffect(() => { load(); }, [refreshKey]);

  const searchProblems = () => {
    adminApi.getDailyProblemPicker({ search: search || undefined, limit: 50 })
      .then(({ data }) => setProblems(data.data || []));
  };

  const loadIntoForm = (s: ScheduleRow) => {
    setScheduleDate(s.scheduleDate);
    setProblemSlug(s.problemSlug);
    setCustomTitle(s.customTitle || 'New daily problem is live!');
    setAutoEnd(false);
    const pub = new Date(s.publishAt);
    setPublishTime(`${String(pub.getUTCHours()).padStart(2, '0')}:${String(pub.getUTCMinutes()).padStart(2, '0')}`);
    const endIso = s.validUntil || s.endAt;
    if (endIso) {
      const end = new Date(endIso);
      setEndDate(end.toISOString().split('T')[0]);
      setEndTime(`${String(end.getUTCHours()).padStart(2, '0')}:${String(end.getUTCMinutes()).padStart(2, '0')}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async () => {
    if (!problemSlug) {
      toast.error('Select a problem');
      return;
    }
    if (!windowValid) {
      toast.error('End time must be after publish time');
      return;
    }
    setSaving(true);
    try {
      await adminApi.scheduleDailyProblem({
        scheduleDate,
        problemSlug,
        publishTime,
        endDate,
        endTime,
        customTitle,
      });
      toast.success('Scheduled with your publish and end times');
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to schedule');
    } finally {
      setSaving(false);
    }
  };

  const publishNow = async (date: string) => {
    try {
      await adminApi.publishDailyProblemNow(date);
      toast.success('Published! Same window length kept from your end time.');
      load();
    } catch {
      toast.error('Publish failed');
    }
  };

  const remove = async (date: string) => {
    if (!confirm('Remove this schedule?')) return;
    try {
      await adminApi.deleteDailyProblem(date);
      toast.success('Removed');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <AdminPage className="space-y-6">
      <AdminSection>
        <div className="admin-card admin-card-glow p-6">
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/30 to-amber-500/10 ring-1 ring-amber-500/25"
            >
              <Code2 className="h-6 w-6 text-amber-400" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold">Daily problem scheduler</h3>
              <p className="text-xs text-white/45">
                Set publish and end date/time (UTC). Users see the problem in practice & daily streak only during that window.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Input label="Schedule date" type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
            <Input label="Publish time (UTC)" type="time" value={publishTime} onChange={(e) => setPublishTime(e.target.value)} />
            <Input label="End date (UTC)" type="date" value={endDate} onChange={(e) => { setAutoEnd(false); setEndDate(e.target.value); }} />
            <Input label="End time (UTC)" type="time" value={endTime} onChange={(e) => { setAutoEnd(false); setEndTime(e.target.value); }} />
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
              <input
                type="checkbox"
                checked={autoEnd}
                onChange={(e) => setAutoEnd(e.target.checked)}
                className="rounded border-white/20"
              />
              Auto end = publish + 24 hours
            </label>
            {!windowValid && (
              <span className="text-xs text-red-400">End must be after publish time</span>
            )}
            {windowValid && (
              <span className="text-xs text-amber-400/80">Window length: {formatDuration(windowMs)}</span>
            )}
          </div>

          <Input label="Notification title" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} className="mb-4" />

          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 mb-3">Window preview</p>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center text-sm">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                <p className="text-[10px] uppercase text-emerald-400/80 mb-0.5">Publish starts</p>
                <p className="font-mono text-emerald-100">{formatUtc(publishAt.toISOString())}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-amber-400/60 mx-auto hidden sm:block" />
              <div className={cn('rounded-lg border px-3 py-2.5', windowValid ? 'border-red-500/20 bg-red-500/5' : 'border-red-500/40 bg-red-500/10')}>
                <p className="text-[10px] uppercase text-red-400/80 mb-0.5">Ends</p>
                <p className="font-mono text-red-100">{formatUtc(endAt.toISOString())}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchProblems()} placeholder="Search problems…" className="flex-1" />
            <Button variant="secondary" onClick={searchProblems}><Search className="h-4 w-4" /></Button>
          </div>

          <Select label="Problem of the day" value={problemSlug} onChange={(e) => setProblemSlug(e.target.value)}>
            <option value="">Select problem…</option>
            {problems.map((p) => (
              <option key={p.slug} value={p.slug}>
                #{p.leetcodeId} {p.title} ({p.difficulty})
              </option>
            ))}
          </Select>

          <Button onClick={save} loading={saving} disabled={!windowValid} className="mt-4">
            <Send className="h-4 w-4" /> Save schedule
          </Button>
        </div>
      </AdminSection>

      <AdminSection delay={0.1}>
        <div className="admin-card admin-card-glow overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-500/10 font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-400" /> Scheduled problems
          </div>

          {schedules.length === 0 ? (
            <p className="p-8 text-center text-white/40 text-sm">No schedules yet</p>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/35 border-b border-white/5">
                <div className="col-span-3">Problem</div>
                <div className="col-span-2">Publish (UTC)</div>
                <div className="col-span-2">End (UTC)</div>
                <div className="col-span-1">Window</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>
              <div className="divide-y divide-white/5">
                {schedules.map((s, i) => {
                  const endIso = s.validUntil || s.endAt || '';
                  const pub = new Date(s.publishAt);
                  const end = endIso ? new Date(endIso) : null;
                  const duration = end ? end.getTime() - pub.getTime() : WINDOW_MS;
                  return (
                    <motion.div
                      key={s._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-4 hover:bg-amber-500/[0.03]"
                    >
                      <div className="col-span-3 min-w-0">
                        <button type="button" onClick={() => loadIntoForm(s)} className="text-left hover:text-amber-300 transition-colors">
                          <p className="font-semibold truncate">{s.problemTitle || s.problemSlug}</p>
                        </button>
                        <p className="text-xs text-white/40">{s.scheduleDate} · {s.problemDifficulty}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-emerald-300/90 font-mono flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          {formatUtc(s.publishAt)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-red-300/90 font-mono flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          {endIso ? formatUtc(endIso) : '—'}
                        </p>
                        {s.isLive && s.remainingMs != null && s.remainingMs > 0 && (
                          <p className="text-[10px] text-amber-400/80 mt-0.5">{formatRemaining(s.remainingMs)}</p>
                        )}
                      </div>
                      <div className="col-span-1 text-xs text-white/45">{formatDuration(duration)}</div>
                      <div className="col-span-1">
                        {statusBadge(s)}
                        {s.notificationSent && (
                          <p className="text-[10px] text-white/30 mt-1">Notified</p>
                        )}
                      </div>
                      <div className="col-span-3 flex flex-wrap gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => loadIntoForm(s)}>Edit</Button>
                        {s.isPending && (
                          <Button size="sm" variant="secondary" onClick={() => publishNow(s.scheduleDate)}>
                            <Zap className="h-3.5 w-3.5" /> Publish now
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => remove(s.scheduleDate)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </AdminSection>
    </AdminPage>
  );
}
