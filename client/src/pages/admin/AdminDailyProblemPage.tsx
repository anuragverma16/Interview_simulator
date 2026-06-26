import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Code2, Send, Trash2, Zap, Search } from 'lucide-react';
import { adminApi } from '../../services/api';
import Input, { Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { AdminPage, AdminSection } from '../../components/admin/AdminMotion';
import { useAdminRefresh } from '../../contexts/AdminRefreshContext';
import toast from 'react-hot-toast';

interface ScheduleRow {
  _id: string;
  scheduleDate: string;
  problemSlug: string;
  problemTitle?: string;
  problemDifficulty?: string;
  publishAt: string;
  notificationSent: boolean;
  isPublished?: boolean;
  customTitle?: string;
}

interface ProblemPick {
  slug: string;
  title: string;
  difficulty: string;
  leetcodeId: number;
}

function todayInput() {
  return new Date().toISOString().split('T')[0];
}

export default function AdminDailyProblemPage() {
  const { refreshKey } = useAdminRefresh();
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [problems, setProblems] = useState<ProblemPick[]>([]);
  const [search, setSearch] = useState('');
  const [scheduleDate, setScheduleDate] = useState(todayInput());
  const [publishTime, setPublishTime] = useState('00:00');
  const [problemSlug, setProblemSlug] = useState('');
  const [customTitle, setCustomTitle] = useState('New daily problem is live!');
  const [saving, setSaving] = useState(false);

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

  const save = async () => {
    if (!problemSlug) {
      toast.error('Select a problem');
      return;
    }
    setSaving(true);
    try {
      await adminApi.scheduleDailyProblem({
        scheduleDate,
        problemSlug,
        publishTime,
        customTitle,
      });
      toast.success('Daily problem scheduled — users see it in practice for 24h at publish time');
      load();
    } catch {
      toast.error('Failed to schedule');
    } finally {
      setSaving(false);
    }
  };

  const publishNow = async (date: string) => {
    try {
      await adminApi.publishDailyProblemNow(date);
      toast.success('Published! All users notified.');
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
              <p className="text-xs text-white/45">Pick a problem and publish time (UTC). Users see it in Practice Problems for 24 hours and get a notification. Daily streak still uses the same problem.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Input label="Date" type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
            <Input label="Publish time (UTC)" type="time" value={publishTime} onChange={(e) => setPublishTime(e.target.value)} />
            <Input label="Notification title" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} className="md:col-span-2" />
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

          <Button onClick={save} loading={saving} className="mt-4">
            <Send className="h-4 w-4" /> Schedule & notify users at {publishTime} UTC
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
            <div className="divide-y divide-white/5">
              {schedules.map((s, i) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 hover:bg-amber-500/[0.03]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{s.problemTitle || s.problemSlug}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {s.scheduleDate} · publishes {new Date(s.publishAt).toLocaleString()} · {s.problemDifficulty}
                    </p>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${s.isPublished ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                      {s.isPublished ? 'Live + notified' : s.notificationSent ? 'Notified' : 'Scheduled'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {!s.isPublished && (
                      <Button size="sm" variant="secondary" onClick={() => publishNow(s.scheduleDate)}>
                        <Zap className="h-3.5 w-3.5" /> Publish now
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => remove(s.scheduleDate)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </AdminSection>
    </AdminPage>
  );
}
