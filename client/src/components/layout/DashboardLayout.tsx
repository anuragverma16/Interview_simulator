import { useEffect, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import ParticleBackground from '../animations/ParticleBackground';
import MouseGlow from '../animations/MouseGlow';
import PageTransition from '../animations/PageTransition';
import { LayoutProvider } from '../../contexts/LayoutContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { codingApi } from '../../services/api';
import type { CodingStreakData } from '../../types';

export default function DashboardLayout() {
  const { user } = useAuth();
  const { showParticles, reduceMotion } = useTheme();
  const [streak, setStreak] = useState(user?.stats?.streak || 0);
  const [streakData, setStreakData] = useState<CodingStreakData | null>(null);

  const refreshStreak = useCallback(() => {
    codingApi.getStreak()
      .then(({ data }) => {
        setStreakData(data.data);
        setStreak(data.data.currentStreak ?? 0);
      })
      .catch(() => setStreak(user?.stats?.streak || 0));
  }, [user?.stats?.streak]);

  useEffect(() => {
    refreshStreak();
    const id = setInterval(refreshStreak, 120000);
    return () => clearInterval(id);
  }, [refreshStreak]);

  return (
    <LayoutProvider value={{ streak, streakData, refreshStreak }}>
      <div className="min-h-screen">
        {showParticles && !reduceMotion && <ParticleBackground />}
        {!reduceMotion && <MouseGlow />}
        <Sidebar />
        <TopNavbar streak={streak} streakData={streakData} />
        <main className="lg:pl-64">
          <div className="p-4 pt-14 lg:p-8 lg:pt-16">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>
    </LayoutProvider>
  );
}
