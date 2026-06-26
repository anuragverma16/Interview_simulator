import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute, PublicRoute } from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/admin/AdminLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import SkillGapPage from './pages/SkillGapPage';
import InterviewPage from './pages/InterviewPage';
import CodingPage from './pages/CodingPage';
import CareerPage from './pages/CareerPage';
import RoadmapPage from './pages/RoadmapPage';
import AchievementsPage from './pages/AchievementsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import StreakLeaderboardPage from './pages/StreakLeaderboardPage';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminActivityPage from './pages/admin/AdminActivityPage';
import AdminDailyProblemPage from './pages/admin/AdminDailyProblemPage';
import AdminLeaderboardPage from './pages/admin/AdminLeaderboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a1a27', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

          <Route element={<ProtectedRoute userOnly />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/resume" element={<ResumeAnalyzerPage />} />
              <Route path="/skill-gap" element={<SkillGapPage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/coding/daily" element={<CodingPage key="coding-daily" streakOnly />} />
              <Route path="/coding" element={<CodingPage key="coding-practice" />} />
              <Route path="/career" element={<CareerPage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/streak-leaderboard" element={<StreakLeaderboardPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute adminOnly />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminOverviewPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/users/:userId" element={<AdminUserDetailPage />} />
              <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
              <Route path="/admin/daily-problem" element={<AdminDailyProblemPage />} />
              <Route path="/admin/leaderboard" element={<AdminLeaderboardPage />} />
              <Route path="/admin/activity" element={<AdminActivityPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
