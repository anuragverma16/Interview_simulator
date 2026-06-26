import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, Mic, FileText, Activity, UserPlus, ArrowRight, Bell, Code2,
  Ban, TrendingUp, Send, Shield,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { adminApi } from '../../services/api';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { formatDate } from '../../utils/cn';
import { userInitials, formatActionLabel } from '../../components/admin/adminUtils';
import { AdminPage, AdminSection, AdminStatCardMotion } from '../../components/admin/AdminMotion';
import AdminStatCard from '../../components/admin/AdminStatCard';
import { useAdminRefresh } from '../../contexts/AdminRefreshContext';
import toast from 'react-hot-toast';

interface AdminStats {
  totalUsers: number;
  totalInterviews: number;
  totalResumes: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersWeek: number;
  notificationsSent: number;
  codingSubmissions: number;
  recentUsers: { _id: string; name: string; email: string; role: string; createdAt: string; isActive?: boolean; stats?: { xp: number } }[];
  recentLogs: { _id: string; action: string; createdAt: string; adminId?: { name: string }; details?: { title?: string } }[];
  registrations: { _id: string; count: number }[];
  weeklyInterviews: { _id: string; count: number }[];
  weeklyCoding: { _id: string; count: number }[];
}

const quickActions = [
  { label: 'Manage users', icon: Users, to: '/admin/users', color: 'from-cyan-500/20 to-blue-500/10' },
  { label: 'Send notification', icon: Send, to: '/admin/notifications', color: 'from-purple-500/20 to-pink-500/10' },
  { label: 'View audit log', icon: Shield, to: '/admin/activity', color: 'from-amber-500/20 to-orange-500/10' },
];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const navigate = useNavigate();
  const { refreshKey } = useAdminRefresh();

  const load = () => {
    adminApi.getStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => toast.error('Failed to load overview'));
  };

  useEffect(() => { load(); }, [refreshKey]);

  if (!stats) return <DashboardSkeleton />;

  const chartData = stats.registrations.map((r) => ({ date: r._id.slice(5), signups: r.count }));
  const activityData = (stats.weeklyInterviews || []).map((row, i) => ({
    date: row._id.slice(5),
    interviews: row.count,
    coding: stats.weeklyCoding?.[i]?.count ?? 0,
  }));

  const kpis = [
    { label: 'Total users', value: stats.totalUsers, icon: Users, accent: 'text-cyan-400', bg: 'from-cyan-500/25', trend: `+${stats.newUsersWeek} this week` },
    { label: 'Active (24h)', value: stats.activeUsers, icon: Activity, accent: 'text-emerald-400', bg: 'from-emerald-500/25', trend: `${Math.round((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}% of users` },
    { label: 'Interviews', value: stats.totalInterviews, icon: Mic, accent: 'text-purple-400', bg: 'from-purple-500/25' },
    { label: 'Coding submits', value: stats.codingSubmissions, icon: Code2, accent: 'text-orange-400', bg: 'from-orange-500/25' },
    { label: 'Resumes', value: stats.totalResumes, icon: FileText, accent: 'text-teal-400', bg: 'from-teal-500/25' },
    { label: 'Notifications', value: stats.notificationsSent, icon: Bell, accent: 'text-pink-400', bg: 'from-pink-500/25' },
    { label: 'Suspended', value: stats.suspendedUsers, icon: Ban, accent: 'text-red-400', bg: 'from-red-500/25' },
    { label: 'New (7d)', value: stats.newUsersWeek, icon: TrendingUp, accent: 'text-amber-400', bg: 'from-amber-500/25' },
  ];

  return (
    <AdminPage className="space-y-6">
      <AdminSection>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          {kpis.map((k, i) => (
            <AdminStatCardMotion key={k.label} index={i}>
              <AdminStatCard {...k} />
            </AdminStatCardMotion>
          ))}
        </div>
      </AdminSection>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <AdminSection className="xl:col-span-2 space-y-6" delay={0.1}>
          <div className="admin-card admin-card-glow p-5">
            <h3 className="font-semibold text-white">Registration trend</h3>
            <p className="text-xs text-white/40 mb-4">New signups — last 30 days</p>
            <div className="h-52">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="adminReg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#12121a', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12 }} />
                    <Area type="monotone" dataKey="signups" stroke="#f59e0b" fill="url(#adminReg)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-white/35">No registration data</div>
              )}
            </div>
          </div>

          <div className="admin-card admin-card-glow p-5">
            <h3 className="font-semibold">Platform activity</h3>
            <p className="text-xs text-white/40 mb-4">Interviews & coding — last 7 days</p>
            <div className="h-48">
              {activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData} barGap={4}>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="interviews" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="coding" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-white/35">No activity this week</div>
              )}
            </div>
          </div>
        </AdminSection>

        <AdminSection className="space-y-6" delay={0.15}>
          <div className="admin-card p-5">
            <h3 className="text-sm font-semibold mb-3 text-white/80">Quick actions</h3>
            <div className="space-y-2">
              {quickActions.map((a, i) => (
                <motion.button
                  key={a.to}
                  type="button"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  whileHover={{ x: 4 }}
                  onClick={() => navigate(a.to)}
                  className={`w-full flex items-center gap-3 rounded-xl border border-white/10 bg-gradient-to-r ${a.color} px-4 py-3 text-left hover:border-amber-500/25 transition-colors`}
                >
                  <a.icon className="h-4 w-4 text-amber-300/80" />
                  <span className="text-sm font-medium">{a.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-auto text-white/30" />
                </motion.button>
              ))}
            </div>
          </div>

          <div className="admin-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-amber-400" />
                <h3 className="font-semibold">Recent users</h3>
              </div>
              <button type="button" onClick={() => navigate('/admin/users')} className="text-xs text-amber-400 hover:underline flex items-center gap-1">
                All <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-1.5 max-h-52 overflow-y-auto admin-scrollbar">
              {stats.recentUsers.map((u, i) => (
                <motion.button
                  key={u._id}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => navigate(`/admin/users/${u._id}`)}
                  className="w-full flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-left"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-xs font-bold text-amber-200">
                    {userInitials(u.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-[10px] text-white/35 truncate">{u.email}</p>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${u.isActive === false ? 'bg-red-500/15 text-red-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                    {u.isActive === false ? 'Off' : 'On'}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="admin-card p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-400" /> Live feed
            </h3>
            <div className="space-y-2 max-h-44 overflow-y-auto admin-scrollbar">
              {(stats.recentLogs || []).length === 0 ? (
                <p className="text-xs text-white/35">No admin actions yet</p>
              ) : (
                stats.recentLogs.map((log, i) => (
                  <motion.div
                    key={log._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                  >
                    <p className="text-xs font-medium">{formatActionLabel(log.action)}</p>
                    <p className="text-[10px] text-white/35 mt-0.5">
                      {log.adminId?.name || 'Admin'} · {formatDate(log.createdAt)}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </AdminSection>
      </div>
    </AdminPage>
  );
}
