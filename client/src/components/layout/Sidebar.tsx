import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Target, Mic, TrendingUp,
  Map, Trophy, Menu, X, Sparkles, ListChecks, Flame,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/resume', icon: FileText, label: 'Resume Analyzer' },
  { to: '/skill-gap', icon: Target, label: 'Skill Gap' },
  { to: '/interview', icon: Mic, label: 'AI Interview' },
  { to: '/coding/daily', icon: Flame, label: 'Daily Streak' },
  { to: '/coding', icon: ListChecks, label: 'Practice Problems' },
  { to: '/career', icon: TrendingUp, label: 'Career Prediction' },
  { to: '/roadmap', icon: Map, label: 'Learning Roadmap' },
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);  const location = useLocation();

  const sidebar = (
    <aside className="flex h-dvh w-64 flex-col glass border-r border-white/10">
      <div className="flex items-center gap-2 p-6 border-b border-white/10 shrink-0">
        <Sparkles className="h-6 w-6 text-purple-400" />
        <span className="text-lg font-bold font-[family-name:var(--font-display)] neon-text">InterviewIQ</span>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto admin-scrollbar p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-150 ease-out',
                isActive
                  ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/10 text-white border border-purple-500/30 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0 transition-transform duration-150', isActive && 'scale-110')} />
              {label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 rounded-xl glass p-2 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:h-dvh">{sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-dvh">{sidebar}</div>
        </div>
      )}
    </>
  );
}
