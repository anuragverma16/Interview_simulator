import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Mic, FileText, Activity, UserPlus } from 'lucide-react';
import Card from '../ui/Card';
import { formatDate } from '../../utils/cn';

interface AdminStats {
  totalUsers: number;
  totalInterviews: number;
  totalResumes: number;
  activeUsers: number;
  recentUsers: { _id: string; name: string; email: string; role: string; createdAt: string; stats?: { xp: number } }[];
  registrations: { _id: string; count: number }[];
}

interface Props {
  stats: AdminStats;
  onViewUser: (id: string) => void;
}

export default function AdminOverview({ stats, onViewUser }: Props) {
  const chartData = stats.registrations.map((r) => ({
    date: r._id.slice(5),
    users: r.count,
  }));

  const kpis = [
    { label: 'Total Users', value: stats.totalUsers, sub: 'Registered accounts', icon: Users, gradient: 'from-cyan-500 to-blue-600' },
    { label: 'Interviews', value: stats.totalInterviews, sub: 'Sessions completed', icon: Mic, gradient: 'from-purple-500 to-pink-600' },
    { label: 'Resumes', value: stats.totalResumes, sub: 'Analyses run', icon: FileText, gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Active (24h)', value: stats.activeUsers, sub: 'Logged in today', icon: Activity, gradient: 'from-orange-500 to-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="!p-5 relative overflow-hidden">
            <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${k.gradient} opacity-10`} />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted">{k.label}</p>
                <p className="text-3xl font-bold mt-1 tabular-nums">{k.value.toLocaleString()}</p>
                <p className="text-xs text-muted mt-1">{k.sub}</p>
              </div>
              <div className={`rounded-xl bg-gradient-to-br ${k.gradient} p-2.5 shadow-lg`}>
                <k.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 !p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-themed">User registrations</h3>
              <p className="text-xs text-muted">Last 30 days</p>
            </div>
          </div>
          <div className="h-56">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="adminRegGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#a855f7" fill="url(#adminRegGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">No registration data yet</div>
            )}
          </div>
        </Card>

        <Card className="!p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="h-4 w-4 text-purple-400" />
            <h3 className="font-semibold text-themed">Recent signups</h3>
          </div>
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {stats.recentUsers.length === 0 ? (
              <p className="text-sm text-muted">No users yet</p>
            ) : (
              stats.recentUsers.map((u) => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => onViewUser(u._id)}
                  className="w-full flex items-center gap-3 rounded-xl p-2.5 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 text-xs font-bold">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-muted truncate">{u.email}</p>
                  </div>
                  <span className="text-[10px] text-muted shrink-0">{formatDate(u.createdAt)}</span>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
