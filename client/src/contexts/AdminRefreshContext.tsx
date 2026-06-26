import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AdminRefreshContextType {
  refreshKey: number;
  triggerRefresh: () => void;
  refreshing: boolean;
  setRefreshing: (v: boolean) => void;
}

const AdminRefreshContext = createContext<AdminRefreshContextType | null>(null);

export function AdminRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const triggerRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  return (
    <AdminRefreshContext.Provider value={{ refreshKey, triggerRefresh, refreshing, setRefreshing }}>
      {children}
    </AdminRefreshContext.Provider>
  );
}

export function useAdminRefresh() {
  const ctx = useContext(AdminRefreshContext);
  if (!ctx) throw new Error('useAdminRefresh must be used within AdminRefreshProvider');
  return ctx;
}
