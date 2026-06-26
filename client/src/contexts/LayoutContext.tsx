import { createContext, useContext, type ReactNode } from 'react';
import type { CodingStreakData } from '../types';

export interface LayoutContextValue {
  streak: number;
  streakData: CodingStreakData | null;
  refreshStreak: () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: LayoutContextValue;
}) {
  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within DashboardLayout');
  return ctx;
}

export function useLayoutOptional() {
  return useContext(LayoutContext);
}
