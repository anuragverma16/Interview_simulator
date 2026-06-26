import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../animations/LoadingScreen';

export function ProtectedRoute({
  children,
  adminOnly = false,
  userOnly = false,
}: {
  children?: React.ReactNode;
  adminOnly?: boolean;
  userOnly?: boolean;
}) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (userOnly && user.role === 'admin') return <Navigate to="/admin" replace />;

  return children ? <>{children}</> : <Outlet />;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return <>{children}</>;
}
