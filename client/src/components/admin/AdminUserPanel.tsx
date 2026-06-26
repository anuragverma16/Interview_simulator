import { useEffect, useState } from 'react';
import {
  X, Bell, Send, Mail, Trophy, Code2, Flame, MapPin, Link2,
  Calendar, Shield, Zap, MessageSquare, Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '../../services/api';
import Button from '../ui/Button';
import Input, { Textarea, Select } from '../ui/Input';
import { formatDate, cn } from '../../utils/cn';
import toast from 'react-hot-toast';

const NOTIFICATION_TEMPLATES = [
  { title: 'Great progress!', message: 'You are doing amazing. Keep up your daily coding streak!' },
  { title: 'Daily challenge reminder', message: 'Your daily coding problem is waiting. Solve it before midnight to keep your streak.' },
  { title: 'Interview feedback ready', message: 'Your latest mock interview has been reviewed. Check your dashboard for detailed feedback.' },
  { title: 'Welcome to InterviewIQ', message: 'Thanks for joining! Complete your profile and try your first AI mock interview.' },
];

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
    avatar?: string;
    isActive?: boolean;
    createdAt: string;
    lastLogin?: string;
    profile?: { bio?: string; location?: string; linkedin?: string; github?: string; targetRole?: string; experience?: string };
    stats: { xp: number; level: number; streak: number; totalInterviews: number; avgScore: number };
  };
  activity: { interviews: number; resumes: number; codingSolved: number; achievements: number };
  streak: { currentStreak?: number; longestStreak?: number; streakPoints?: number; totalSolved?: number } | null;
  notifications: { _id: string; title: string; message: string; createdAt: string; expiresAt: string; read?: boolean }[];
}

interface Props {
  userId: string | null;
  initialTab?: 'profile' | 'notify';
  onClose: () => void;
}

export default function AdminUserPanel({ userId, initialTab = 'profile', onClose }: Props) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<'profile' | 'notify'>(initialTab);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('/dashboard');
  const [expiresInHours, setExpiresInHours] = useState('24');

  const loadUser = (id: string) => {
    setLoading(true);
    adminApi.getUser(id)
      .then(({ data }: { data: { data: UserDetail } }) => setDetail(data.data))
      .catch(() => toast.error('Failed to load user'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!userId) {
      setDetail(null);
      return;
    }
    setTab(initialTab);
    setTitle('');
    setMessage('');
    loadUser(userId);
  }, [userId, initialTab]);

  const applyTemplate = (t: (typeof NOTIFICATION_TEMPLATES)[0]) => {
    setTitle(t.title);
    setMessage(t.message);
  };

  const sendNotification = async () => {
    if (!userId || !title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setSending(true);
    try {
      await adminApi.sendNotification(userId, {
        title: title.trim(),
        message: message.trim(),
        actionUrl,
        actionLabel: 'View',
        expiresInHours: parseInt(expiresInHours, 10),
      });
      toast.success(`Notification delivered to ${detail?.user.name}`);
      setTitle('');
      setMessage('');
      loadUser(userId);
      setTab('notify');
    } catch {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  if (!userId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-0 h-full w-full max-w-lg border-l border-white/10 bg-[#0e0e14] shadow-2xl flex flex-col"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 shrink-0">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-purple-400 font-semibold">User profile</p>
              <h2 className="text-lg font-bold">{detail?.user.name || 'Loading…'}</h2>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-muted hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {loading && !detail ? (
            <div className="flex-1 flex items-center justify-center text-muted">Loading user data…</div>
          ) : detail ? (
            <>
              <div className="px-5 pt-4 pb-0 shrink-0">
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-cyan-500/5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 text-xl font-bold text-white shadow-lg">
                    {detail.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{detail.user.name}</p>
                    <p className="text-xs text-muted flex items-center gap-1 truncate"><Mail className="h-3 w-3 shrink-0" /> {detail.user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full font-medium',
                        detail.user.role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-muted'
                      )}>
                        {detail.user.role}
                      </span>
                      <span className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full font-medium',
                        detail.user.isActive !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      )}>
                        {detail.user.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 mt-4 p-1 rounded-xl bg-white/5">
                  {(['profile', 'notify'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={cn(
                        'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
                        tab === t ? 'bg-purple-500/20 text-purple-300' : 'text-muted hover:text-themed'
                      )}
                    >
                      {t === 'profile' ? 'Overview' : 'Notifications'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {tab === 'profile' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'XP', value: detail.user.stats?.xp ?? 0, icon: Zap, color: 'text-purple-400' },
                        { label: 'Level', value: `Lv.${detail.user.stats?.level ?? 1}`, icon: Shield, color: 'text-cyan-400' },
                        { label: 'Streak', value: detail.streak?.currentStreak ?? 0, icon: Flame, color: 'text-orange-400' },
                        { label: 'Solved', value: detail.activity.codingSolved, icon: Code2, color: 'text-emerald-400' },
                      ].map((s) => (
                        <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                          <s.icon className={cn('h-4 w-4 mx-auto mb-1', s.color)} />
                          <p className="text-lg font-bold tabular-nums">{s.value}</p>
                          <p className="text-[10px] text-muted uppercase">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {[
                        { icon: Trophy, label: 'Interviews', value: detail.activity.interviews },
                        { icon: Code2, label: 'Resumes', value: detail.activity.resumes },
                        { icon: Flame, label: 'Badges', value: detail.activity.achievements },
                      ].map((a) => (
                        <div key={a.label} className="rounded-lg bg-white/5 py-3 flex flex-col items-center gap-1">
                          <a.icon className="h-4 w-4 text-amber-400" />
                          <span className="font-bold">{a.value}</span>
                          <span className="text-muted">{a.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-white/10 p-4 space-y-2 text-sm">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Account details</h4>
                      <p className="flex items-center gap-2 text-muted"><Calendar className="h-3.5 w-3.5" /> Joined {formatDate(detail.user.createdAt)}</p>
                      {detail.user.lastLogin && (
                        <p className="flex items-center gap-2 text-muted"><Clock className="h-3.5 w-3.5" /> Last login {formatDate(detail.user.lastLogin)}</p>
                      )}
                      {detail.user.profile?.targetRole && (
                        <p className="text-muted">Target role: <span className="text-themed">{detail.user.profile.targetRole}</span></p>
                      )}
                      {detail.user.profile?.location && (
                        <p className="flex items-center gap-2 text-muted"><MapPin className="h-3.5 w-3.5" /> {detail.user.profile.location}</p>
                      )}
                      {detail.user.profile?.github && (
                        <p className="flex items-center gap-2 text-muted truncate"><Link2 className="h-3.5 w-3.5 shrink-0" /> {detail.user.profile.github}</p>
                      )}
                      {detail.user.profile?.linkedin && (
                        <p className="flex items-center gap-2 text-muted truncate"><Link2 className="h-3.5 w-3.5 shrink-0" /> {detail.user.profile.linkedin}</p>
                      )}
                      {detail.user.profile?.bio && (
                        <p className="text-muted text-xs mt-2 pt-2 border-t border-white/10">{detail.user.profile.bio}</p>
                      )}
                    </div>

                    <Button variant="secondary" className="w-full" onClick={() => setTab('notify')}>
                      <Bell className="h-4 w-4" /> Send notification to this user
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <p className="text-xs text-muted">Quick templates</p>
                      <div className="flex flex-wrap gap-2">
                        {NOTIFICATION_TEMPLATES.map((t) => (
                          <button
                            key={t.title}
                            type="button"
                            onClick={() => applyTemplate(t)}
                            className="text-xs px-3 py-1.5 rounded-full border border-white/15 hover:border-purple-500/40 hover:bg-purple-500/10 transition-colors"
                          >
                            {t.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-400" />
                        Compose notification
                      </h3>
                      <Input
                        label="Title"
                        value={title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                        placeholder="Notification headline"
                      />
                      <Textarea
                        label="Message"
                        value={message}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                        placeholder="This appears in the user's notification bell…"
                      />
                      <Select label="Link destination" value={actionUrl} onChange={(e) => setActionUrl(e.target.value)}>
                        {LINK_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </Select>
                      <Select label="Expires after" value={expiresInHours} onChange={(e) => setExpiresInHours(e.target.value)}>
                        <option value="6">6 hours</option>
                        <option value="24">24 hours</option>
                        <option value="48">48 hours</option>
                        <option value="168">7 days</option>
                      </Select>

                      {(title || message) && (
                        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                          <p className="text-[10px] uppercase text-muted mb-2">Preview</p>
                          <p className="text-sm font-semibold">{title || 'Title'}</p>
                          <p className="text-xs text-muted mt-1">{message || 'Message body'}</p>
                        </div>
                      )}

                      <Button onClick={sendNotification} loading={sending} className="w-full">
                        <Send className="h-4 w-4" /> Send to {detail.user.name}
                      </Button>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                        Sent to this user ({detail.notifications.length})
                      </h4>
                      {detail.notifications.length === 0 ? (
                        <p className="text-sm text-muted">No notifications sent yet</p>
                      ) : (
                        <div className="space-y-2">
                          {detail.notifications.map((n) => (
                            <div key={n._id} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium">{n.title}</p>
                                {n.read && <span className="text-[10px] text-emerald-400 shrink-0">Read</span>}
                              </div>
                              <p className="text-xs text-muted mt-1 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-muted/60 mt-2">{formatDate(n.createdAt)} · expires {formatDate(n.expiresAt)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : null}
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}
