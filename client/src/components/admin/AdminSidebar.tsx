import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, ScrollText, Shield, LogOut, Bell, Sparkles, Code2, Trophy,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';
import { userInitials } from './adminUtils';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true, desc: 'Metrics & analytics' },
  { to: '/admin/users', icon: Users, label: 'Users', end: false, desc: 'Manage accounts' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications', end: false, desc: 'Send messages' },
  { to: '/admin/daily-problem', icon: Code2, label: 'Daily problem', end: false, desc: 'Schedule & publish' },
  { to: '/admin/leaderboard', icon: Trophy, label: 'Rankings', end: false, desc: 'XP leaderboard' },
  { to: '/admin/activity', icon: ScrollText, label: 'Audit log', end: false, desc: 'Admin actions' },
];

interface Props {
  onNavigate?: () => void;
}

export default function AdminSidebar({ onNavigate }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="admin-shell-sidebar flex h-dvh w-[272px] flex-col border-r border-amber-500/10 bg-[#0a0a10]/95 backdrop-blur-xl">
      <div className="shrink-0 border-b border-amber-500/10 px-5 py-5">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
            <Shield className="h-5 w-5 text-white" />
            <motion.span
              className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0a0a10]"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-500/90">Control Center</p>
            <p className="text-base font-bold text-white flex items-center gap-1.5">
              InterviewIQ <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            </p>
          </div>
        </motion.div>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto admin-scrollbar space-y-1 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25 px-3 mb-2 sticky top-0 bg-[#0a0a10]/95 py-1 z-10">Navigation</p>
        {navItems.map(({ to, icon: Icon, label, end, desc }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 + i * 0.05 }}
          >
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-100 border border-amber-500/30 shadow-lg shadow-amber-500/5'
                    : 'text-white/45 hover:bg-white/[0.04] hover:text-white border border-transparent'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                    isActive ? 'bg-amber-500/25 text-amber-300' : 'bg-white/5 text-white/50 group-hover:bg-white/10'
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="leading-tight">{label}</p>
                    <p className={cn('text-[10px] truncate', isActive ? 'text-amber-400/60' : 'text-white/25')}>{desc}</p>
                  </div>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-amber-500/10 bg-[#0a0a10] p-4 space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-500/20 text-xs font-bold text-amber-200 ring-1 ring-amber-500/20">
            {userInitials(user?.name || 'A')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-[10px] text-white/35 truncate">{user?.email}</p>
          </div>
        </div>

        <Button
          type="button"
          variant="danger"
          size="sm"
          fullWidth
          onClick={() => {
            onNavigate?.();
            handleLogout();
          }}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>

        <p className="text-[10px] text-center text-white/25 flex items-center justify-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Secure admin session
        </p>
      </div>
    </aside>
  );
}
