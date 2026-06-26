import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCw, Clock, LogOut } from 'lucide-react';
import Button from '../ui/Button';
import { useAdminRefresh } from '../../contexts/AdminRefreshContext';
import { useAuth } from '../../contexts/AuthContext';
import { userInitials } from './adminUtils';

const titles: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'Platform overview', subtitle: 'Real-time metrics, growth analytics & system health' },
  '/admin/users': { title: 'User management', subtitle: 'Browse accounts, view dossiers, manage access' },
  '/admin/notifications': { title: 'Notifications', subtitle: 'Send targeted in-app messages to users' },
  '/admin/daily-problem': { title: 'Daily problem', subtitle: 'Schedule problem of the day with publish time & user alerts' },
  '/admin/leaderboard': { title: 'XP rankings', subtitle: 'Leaderboard by user XP — rank, name, level & streak' },
  '/admin/activity': { title: 'Audit log', subtitle: 'Complete trail of administrative actions' },
};

export default function AdminHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { triggerRefresh, refreshing } = useAdminRefresh();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const base = pathname.startsWith('/admin/users/') && pathname !== '/admin/users'
    ? { title: 'User dossier', subtitle: 'Full profile, activity history & notifications' }
    : titles[pathname] || titles['/admin'];

  return (
    <header className="admin-shell-header sticky top-0 z-30 border-b border-amber-500/10 bg-[#0a0a10]/80 backdrop-blur-xl px-4 pl-14 lg:px-6 lg:pl-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-500/75">Administrator</p>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">{base.title}</h1>
          <p className="text-xs text-white/40 mt-0.5 max-w-xl">{base.subtitle}</p>
        </motion.div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/45">
            <Clock className="h-3.5 w-3.5 text-amber-400/70" />
            {time.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-amber-500/15 bg-amber-500/5 px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/35 to-orange-500/25 text-[10px] font-bold text-amber-100">
              {userInitials(user?.name || 'A')}
            </div>
            <span className="text-xs font-medium text-white/80 max-w-[140px] truncate">{user?.name}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={triggerRefresh} loading={refreshing}>
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Sync data</span>
          </Button>
          <Button variant="danger" size="sm" onClick={handleLogout} aria-label="Logout">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
