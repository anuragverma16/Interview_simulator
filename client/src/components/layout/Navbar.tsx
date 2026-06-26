import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ChevronDown, User, Settings, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import UserAvatar from '../ui/UserAvatar';
import { cn } from '../../utils/cn';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-400" />
          <span className="text-xl font-bold font-[family-name:var(--font-display)] neon-text">InterviewIQ AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          {user && (
            <Link to={dashboardPath} className="hover:text-white transition-colors">Dashboard</Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-20 rounded-lg bg-white/5 animate-pulse" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 pl-1 pr-3 py-1 hover:border-purple-500/40 transition-colors"
                aria-label="Account menu"
              >
                <UserAvatar size="sm" />
                <span className="hidden sm:inline text-sm font-medium text-white/90 max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className={cn('h-3.5 w-3.5 text-white/50 transition-transform', menuOpen && 'rotate-180')} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/15 bg-[#12121a] shadow-xl py-1 z-50">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-white/40 truncate">{user.email}</p>
                  </div>
                  <Link
                    to={dashboardPath}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    {user.role === 'admin' ? <Shield className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
                    {user.role === 'admin' ? 'Admin panel' : 'Dashboard'}
                  </Link>
                  {user.role !== 'admin' && (
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                    >
                      <User className="h-4 w-4" /> Profile
                    </Link>
                  )}
                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/signup" className="gradient-btn text-sm !px-5 !py-2">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
