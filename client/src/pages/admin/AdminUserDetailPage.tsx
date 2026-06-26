import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Bell, Send, Mail, MapPin, Link2, Calendar, Clock,
  Shield, Zap, Flame, Code2, Trophy, FileText, Ban, CheckCircle, Trash2,
  MessageSquare, Mic, Settings,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import Button from '../../components/ui/Button';
import Input, { Textarea, Select } from '../../components/ui/Input';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { formatDate, cn } from '../../utils/cn';
import { userInitials, NOTIFICATION_TEMPLATES } from '../../components/admin/adminUtils';
import toast from 'react-hot-toast';
import axios from 'axios';

const LINK_OPTIONS = [
  { value: '/dashboard', label: 'Dashboard' },
  { value: '/coding', label: 'Coding practice' },
  { value: '/interview', label: 'AI interview' },
  { value: '/achievements', label: 'Achievements' },
  { value: '/profile', label: 'Profile' },
];

interface UserDetail {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive?: boolean;
    createdAt: string;
    lastLogin?: string;
    avatar?: string;
    profile?: Record<string, string>;
    settings?: Record<string, unknown>;
    stats: { xp: number; level: number; streak: number; totalInterviews: number; avgScore: number };
  };
  activity: { interviews: number; resumes: number; codingSolved: number; achievements: number };
  streak: { currentStreak?: number; longestStreak?: number; streakPoints?: number; totalSolved?: number } | null;
  notifications: { _id: string; title: string; message: string; createdAt: string; expiresAt: string; read?: boolean; fromAdminId?: { name: string } }[];
  recentInterviews: { _id: string; type: string; difficulty: string; status: string; analysis?: { overallScore: number }; createdAt: string }[];
  recentCoding: { _id: string; problem?: { title: string; difficulty: string }; language: string; runResults?: { allPassed: boolean }; mode: string; createdAt: string }[];
  recentResumes: { _id: string; fileName: string; analysis?: { resumeScore: number }; createdAt: string }[];
}

type Tab = 'overview' | 'activity' | 'notifications';

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'overview');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('/dashboard');
  const [expiresInHours, setExpiresInHours] = useState('24');
  const [sending, setSending] = useState(false);

  const load = () => {
    if (!userId) return;
    setLoading(true);
    adminApi.getUser(userId)
      .then(({ data }) => setDetail(data.data))
      .catch(() => toast.error('User not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [userId]);

  useEffect(() => {
    const t = searchParams.get('tab') as Tab;
    if (t) setTab(t);
  }, [searchParams]);

  const sendNotification = async () => {
    if (!userId || !title.trim() || !message.trim()) {
      toast.error('Title and message required');
      return;
    }
    if (detail?.user.role !== 'user') {
      toast.error('Notifications can only be sent to regular user accounts');
      return;
    }
    setSending(true);
    try {
      await adminApi.sendNotification(userId, {
        title: title.trim(),
        message: message.trim(),
        actionUrl,
        actionLabel: 'View',
        expiresInHours: parseInt(expiresInHours, 10) || 24,
      });
      toast.success('Notification delivered — visible in user bell icon');
      setTitle('');
      setMessage('');
      load();
      setTab('notifications');
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : null;
      toast.error(typeof msg === 'string' ? msg : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const toggleActive = async () => {
    if (!detail) return;
    const next = detail.user.isActive === false;
    try {
      await adminApi.updateUser(detail.user._id, { isActive: next });
      toast.success(next ? 'User activated' : 'User suspended');
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const deleteUser = async () => {
    if (!userId || !confirm('Delete this user permanently?')) return;
    try {
      await adminApi.deleteUser(userId);
      toast.success('User deleted');
      navigate('/admin/users');
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (!detail) return <div className="admin-card p-8 text-center text-white/50">User not found</div>;

  const { user } = detail;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/admin/users" className="inline-flex items-center gap-1 text-sm text-white/45 hover:text-amber-400 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to users
        </Link>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/5 border-b border-amber-500/10 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-xl font-bold shadow-lg">
              {userInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', user.role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white/60')}>{user.role}</span>
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', user.isActive !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300')}>
                  {user.isActive !== false ? 'Active' : 'Suspended'}
                </span>
              </div>
              <p className="text-sm text-white/50 flex items-center gap-1.5 mt-1"><Mail className="h-3.5 w-3.5" /> {user.email}</p>
              <p className="text-xs text-white/35 mt-1">Member since {formatDate(user.createdAt)}{user.lastLogin ? ` · Last login ${formatDate(user.lastLogin)}` : ''}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => setTab('notifications')}>
                <Bell className="h-4 w-4" /> Send notification
              </Button>
              {user.role !== 'admin' && (
                <>
                  <Button variant="ghost" size="sm" onClick={toggleActive}>
                    {user.isActive !== false ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    {user.isActive !== false ? 'Suspend' : 'Activate'}
                  </Button>
                  <Button variant="danger" size="sm" onClick={deleteUser}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-px bg-white/5">
          {[
            { label: 'XP', value: user.stats?.xp ?? 0, icon: Zap },
            { label: 'Level', value: user.stats?.level ?? 1, icon: Shield },
            { label: 'Streak', value: detail.streak?.currentStreak ?? 0, icon: Flame },
            { label: 'Solved', value: detail.activity.codingSolved, icon: Code2 },
            { label: 'Interviews', value: detail.activity.interviews, icon: Mic },
            { label: 'Badges', value: detail.activity.achievements, icon: Trophy },
          ].map((s) => (
            <div key={s.label} className="bg-[#0c0c12] px-4 py-4 text-center">
              <s.icon className="h-4 w-4 mx-auto text-amber-400/70 mb-1" />
              <p className="text-lg font-bold tabular-nums">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/35">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl border border-white/10 bg-white/[0.02] w-fit">
        {(['overview', 'activity', 'notifications'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors',
              tab === t ? 'bg-amber-500/15 text-amber-200' : 'text-white/45 hover:text-white'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="admin-card p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">Profile</h3>
            <dl className="space-y-3 text-sm">
              {user.profile?.targetRole && <div><dt className="text-white/40 text-xs">Target role</dt><dd className="font-medium">{user.profile.targetRole}</dd></div>}
              {user.profile?.experience && <div><dt className="text-white/40 text-xs">Experience</dt><dd>{user.profile.experience}</dd></div>}
              {user.profile?.location && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-white/40" />{user.profile.location}</div>}
                      {user.profile?.github && <div className="flex items-center gap-2 truncate"><Link2 className="h-3.5 w-3.5 shrink-0 text-white/40" />{user.profile.github}</div>}
                      {user.profile?.linkedin && <div className="flex items-center gap-2 truncate"><Link2 className="h-3.5 w-3.5 shrink-0 text-white/40" />{user.profile.linkedin}</div>}
              {user.profile?.bio && <div><dt className="text-white/40 text-xs mb-1">Bio</dt><dd className="text-white/70">{user.profile.bio}</dd></div>}
              {!user.profile?.bio && !user.profile?.targetRole && <p className="text-white/40 text-sm">No profile details filled in yet</p>}
            </dl>
          </div>

          <div className="admin-card p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 flex items-center gap-2"><Settings className="h-4 w-4" /> Account & settings</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-white/40" /> Joined {formatDate(user.createdAt)}</div>
              {user.lastLogin && <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-white/40" /> Last login {formatDate(user.lastLogin)}</div>}
              <div><dt className="text-white/40 text-xs">Avg interview score</dt><dd className="font-medium">{user.stats?.avgScore ?? 0}%</dd></div>
              <div><dt className="text-white/40 text-xs">Longest streak</dt><dd className="font-medium">{detail.streak?.longestStreak ?? 0} days</dd></div>
              <div><dt className="text-white/40 text-xs">Theme</dt><dd className="capitalize">{String(user.settings?.theme || 'dark')}</dd></div>
            </dl>
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="admin-card p-0 overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10 font-semibold text-sm flex items-center gap-2"><Mic className="h-4 w-4 text-purple-400" /> Recent interviews</div>
            {detail.recentInterviews?.length ? (
              <table className="w-full text-sm">
                <tbody>
                  {detail.recentInterviews.map((i) => (
                    <tr key={i._id} className="border-b border-white/5">
                      <td className="px-5 py-3 capitalize">{i.type}</td>
                      <td className="px-5 py-3 text-white/40">{i.difficulty}</td>
                      <td className="px-5 py-3">{i.analysis?.overallScore ?? '—'}%</td>
                      <td className="px-5 py-3 text-xs text-white/35">{formatDate(i.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="p-5 text-sm text-white/40">No interviews yet</p>}
          </div>

          <div className="admin-card p-0 overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10 font-semibold text-sm flex items-center gap-2"><Code2 className="h-4 w-4 text-cyan-400" /> Recent coding</div>
            {detail.recentCoding?.length ? (
              <table className="w-full text-sm">
                <tbody>
                  {detail.recentCoding.map((c) => (
                    <tr key={c._id} className="border-b border-white/5">
                      <td className="px-5 py-3 truncate max-w-[140px]">{c.problem?.title || 'Problem'}</td>
                      <td className="px-5 py-3 text-white/40">{c.language}</td>
                      <td className="px-5 py-3">{c.runResults?.allPassed ? <span className="text-emerald-400">Passed</span> : <span className="text-red-400">Failed</span>}</td>
                      <td className="px-5 py-3 text-xs text-white/35">{formatDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="p-5 text-sm text-white/40">No submissions yet</p>}
          </div>

          <div className="admin-card p-0 overflow-hidden xl:col-span-2">
            <div className="px-5 py-3 border-b border-white/10 font-semibold text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-400" /> Resumes</div>
            {detail.recentResumes?.length ? (
              <table className="w-full text-sm">
                <tbody>
                  {detail.recentResumes.map((r) => (
                    <tr key={r._id} className="border-b border-white/5">
                      <td className="px-5 py-3">{r.fileName}</td>
                      <td className="px-5 py-3">{r.analysis?.resumeScore ?? '—'}%</td>
                      <td className="px-5 py-3 text-xs text-white/35">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="p-5 text-sm text-white/40">No resumes uploaded</p>}
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="admin-card p-5 space-y-4 border-amber-500/15">
            <h3 className="font-semibold flex items-center gap-2"><MessageSquare className="h-5 w-5 text-amber-400" /> Send to {user.name}</h3>
            <p className="text-xs text-white/45">Message appears in the user&apos;s notification bell (top navbar) instantly.</p>

            <div className="flex flex-wrap gap-2">
              {NOTIFICATION_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setTitle(t.title); setMessage(t.message); setActionUrl(t.actionUrl); }}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/15 hover:border-amber-500/40 hover:bg-amber-500/10"
                >
                  {t.title}
                </button>
              ))}
            </div>

            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification headline" />
            <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Shown in user's notification panel…" />
            <Select label="Link when clicked" value={actionUrl} onChange={(e) => setActionUrl(e.target.value)}>
              {LINK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
            <Select label="Expires after" value={expiresInHours} onChange={(e) => setExpiresInHours(e.target.value)}>
              <option value="6">6 hours</option>
              <option value="24">24 hours</option>
              <option value="48">48 hours</option>
              <option value="168">7 days</option>
            </Select>

            {(title || message) && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-[10px] uppercase text-amber-400/70 mb-2">Preview (user view)</p>
                <p className="font-semibold text-sm">{title || 'Title'}</p>
                <p className="text-xs text-white/55 mt-1">{message || 'Message'}</p>
              </div>
            )}

            <Button onClick={sendNotification} loading={sending} className="w-full" disabled={user.role !== 'user'}>
              <Send className="h-4 w-4" /> Deliver notification
            </Button>
            {user.role !== 'user' && (
              <p className="text-xs text-amber-400/80">Admin accounts cannot receive in-app notifications.</p>
            )}
          </div>

          <div className="admin-card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-white/50" /> Sent to this user ({detail.notifications.length})</h3>
            {detail.notifications.length === 0 ? (
              <p className="text-sm text-white/40">No notifications sent yet</p>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto">
                {detail.notifications.map((n) => (
                  <div key={n._id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex justify-between gap-2">
                      <p className="font-medium text-sm">{n.title}</p>
                      {n.read ? <span className="text-[10px] text-emerald-400 shrink-0">Read</span> : <span className="text-[10px] text-amber-400 shrink-0">Unread</span>}
                    </div>
                    <p className="text-xs text-white/50 mt-1">{n.message}</p>
                    <p className="text-[10px] text-white/30 mt-2">
                      {formatDate(n.createdAt)} · expires {formatDate(n.expiresAt)}
                      {n.fromAdminId?.name ? ` · by ${n.fromAdminId.name}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
