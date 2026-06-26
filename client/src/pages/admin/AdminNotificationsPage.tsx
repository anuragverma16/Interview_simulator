import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Search, Send, MessageSquare, Users } from 'lucide-react';
import { adminApi } from '../../services/api';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { userInitials, NOTIFICATION_TEMPLATES } from '../../components/admin/adminUtils';
import { formatDate } from '../../utils/cn';
import { AdminPage, AdminSection } from '../../components/admin/AdminMotion';
import { useAdminRefresh } from '../../contexts/AdminRefreshContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const LINK_OPTIONS = [
  { value: '/dashboard', label: 'Dashboard' },
  { value: '/coding', label: 'Coding practice' },
  { value: '/interview', label: 'AI interview' },
  { value: '/achievements', label: 'Achievements' },
  { value: '/profile', label: 'Profile' },
];

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

function apiErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.error;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return fallback;
}

export default function AdminNotificationsPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshKey } = useAdminRefresh();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('/dashboard');
  const [expiresInHours, setExpiresInHours] = useState('24');
  const [broadcasting, setBroadcasting] = useState(false);

  const searchUsers = () => {
    setLoading(true);
    adminApi.getUsers({ search: search || undefined, limit: 20 })
      .then(({ data }) => setUsers(data.data.users))
      .catch(() => toast.error('Search failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { searchUsers(); }, [refreshKey]);

  const sendToAllUsers = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    if (!window.confirm('Send this notification to every active user?')) return;

    setBroadcasting(true);
    try {
      const { data } = await adminApi.broadcastNotification({
        title: title.trim(),
        message: message.trim(),
        actionUrl,
        actionLabel: 'View',
        expiresInHours: parseInt(expiresInHours, 10) || 24,
      });
      const count = data.data?.sent ?? 0;
      toast.success(data.message || `Notification sent to ${count} users`);
      setTitle('');
      setMessage('');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Broadcast failed'));
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <AdminPage className="space-y-6">
      <AdminSection>
        <div className="admin-card admin-card-glow p-5 border-purple-500/15">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/25 to-amber-500/10 ring-1 ring-purple-500/20"
            >
              <Users className="h-6 w-6 text-purple-300" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-lg">Message all users</h3>
              <p className="text-xs text-white/45">Broadcast appears in every user&apos;s notification bell</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {NOTIFICATION_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setTitle(t.title); setMessage(t.message); setActionUrl(t.actionUrl); }}
                className="text-xs px-3 py-1.5 rounded-full border border-white/15 hover:border-purple-500/40 hover:bg-purple-500/10"
              >
                {t.title}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification headline" />
            <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message shown in user notification panel…" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select label="Link when clicked" value={actionUrl} onChange={(e) => setActionUrl(e.target.value)}>
                {LINK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
              <Select label="Expires after" value={expiresInHours} onChange={(e) => setExpiresInHours(e.target.value)}>
                <option value="6">6 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="168">7 days</option>
              </Select>
            </div>
            <Button onClick={sendToAllUsers} loading={broadcasting} className="w-full sm:w-auto">
              <Send className="h-4 w-4" /> Send to all active users
            </Button>
          </div>
        </div>
      </AdminSection>

      <AdminSection delay={0.05}>
        <div className="admin-card admin-card-glow p-5">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4, repeatDelay: 3 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/25 to-orange-500/10 ring-1 ring-amber-500/20"
            >
              <Bell className="h-6 w-6 text-amber-400" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-lg">Send to one user</h3>
              <p className="text-xs text-white/45">Search a user and compose a personal notification</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
              placeholder="Search user by name or email…"
              className="flex-1"
            />
            <Button variant="secondary" onClick={searchUsers} loading={loading}>
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </div>
      </AdminSection>

      <AdminSection delay={0.1}>
        <div className="admin-card admin-card-glow overflow-hidden">
          {users.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="h-10 w-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No users found — try a different search</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {users.map((u, i) => (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ backgroundColor: 'rgba(245,158,11,0.04)' }}
                  className="flex items-center gap-4 p-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-sm font-bold text-amber-200 ring-1 ring-amber-500/15">
                    {userInitials(u.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-xs text-white/40 truncate">{u.email}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Joined {formatDate(u.createdAt)}</p>
                  </div>
                  <Button size="sm" onClick={() => navigate(`/admin/users/${u._id}?tab=notifications`)}>
                    <Send className="h-3.5 w-3.5" /> Compose
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </AdminSection>
    </AdminPage>
  );
}
