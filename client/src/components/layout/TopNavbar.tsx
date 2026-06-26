import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Flame, Settings, LogOut, User, ChevronDown, Trophy, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import UserAvatar from '../ui/UserAvatar';
import NavbarNotifications from './NavbarNotifications';
import { useNavbarScroll } from '../../hooks/useNavbarScroll';
import type { CodingStreakData } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  streak?: number;
  streakData?: CodingStreakData | null;
  className?: string;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.05, type: 'spring', stiffness: 420, damping: 28 },
  }),
};

export default function TopNavbar({ streak = 0, streakData = null, className }: Props) {
  const { user, logout } = useAuth();
  const { reduceMotion } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { hidden, scrolled } = useNavbarScroll();

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (hidden) setMenuOpen(false);
  }, [hidden]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const motionEnabled = !reduceMotion;

  return (
    <motion.header
      className={cn(
        'fixed top-0 right-0 z-30 flex items-center gap-2 p-3 lg:pr-8 pointer-events-none',
        'left-0 lg:left-64',
        className
      )}
      initial={false}
      animate={{
        y: motionEnabled && hidden ? -100 : 0,
        opacity: motionEnabled && hidden ? 0 : 1,
      }}
      transition={
        motionEnabled
          ? { type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }
          : { duration: 0 }
      }
    >
      <motion.div
        className={cn(
          'ml-auto flex items-center gap-2 pointer-events-auto',
          'rounded-2xl transition-[background,box-shadow,border,padding] duration-300 ease-out',
          scrolled
            ? 'glass border border-themed/60 shadow-lg shadow-black/10 backdrop-blur-xl px-2.5 py-1.5'
            : 'px-0 py-0 border border-transparent'
        )}
        animate={motionEnabled ? { scale: scrolled ? 0.97 : 1 } : undefined}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      >
        <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible">
          <Link
            to="/"
            title="Home"
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-themed-secondary hover:bg-white/10 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </motion.div>

        <motion.div custom={1} variants={itemVariants} initial="hidden" animate="visible">
          <Link
            to="/coding/daily"
            title="Open daily streak challenge"
            className="flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-sm font-medium text-orange-600 dark:text-orange-300 hover:bg-orange-500/20 transition-colors"
          >
            <Flame className="h-4 w-4 text-orange-500 dark:text-orange-400" />
            <span>{streak}</span>
          </Link>
        </motion.div>

        <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible">
          <NavbarNotifications streakData={streakData} />
        </motion.div>

        <motion.div custom={3} variants={itemVariants} initial="hidden" animate="visible" className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1.5 rounded-full hover:ring-2 hover:ring-purple-500/40 transition-all p-0.5"
            aria-label="Account menu"
          >
            <UserAvatar size="sm" />
            <ChevronDown className={cn('h-3 w-3 text-muted hidden sm:block transition-transform duration-200', menuOpen && 'rotate-180')} />
          </button>

          {menuOpen && (
            <motion.div
              initial={motionEnabled ? { opacity: 0, y: -6, scale: 0.96 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-themed bg-themed-elevated shadow-xl py-1 z-50"
            >
              <div className="px-4 py-3 border-b border-themed">
                <p className="text-sm font-medium truncate text-themed">{user?.name}</p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-themed-secondary hover:bg-themed-hover"
              >
                <User className="h-4 w-4" /> Profile
              </Link>
              <Link
                to="/streak-leaderboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-themed-secondary hover:bg-themed-hover"
              >
                <Trophy className="h-4 w-4" /> Streak Leaderboard
              </Link>
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-themed-secondary hover:bg-themed-hover"
              >
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.header>
  );
}