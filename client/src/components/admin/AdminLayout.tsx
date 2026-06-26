import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { AdminRefreshProvider } from '../../contexts/AdminRefreshContext';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <AdminRefreshProvider>
      <div className="admin-shell min-h-screen bg-[#08080d] text-white relative overflow-hidden">
        <div className="admin-bg-grid pointer-events-none absolute inset-0" />
        <div className="admin-bg-glow pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-amber-500/8 blur-[120px]" />
        <div className="admin-bg-glow pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-orange-600/5 blur-[100px]" />

        <button
          type="button"
          className="fixed left-4 top-4 z-50 rounded-xl border border-amber-500/25 bg-[#0c0c12]/90 backdrop-blur p-2.5 lg:hidden shadow-lg shadow-black/30"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle admin menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[272px]">
          <AdminSidebar />
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
            >
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="absolute left-0 top-0 h-dvh w-[272px]"
                onClick={(e) => e.stopPropagation()}
              >
                <AdminSidebar onNavigate={() => setMobileOpen(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="lg:pl-[272px] min-h-screen flex flex-col relative z-10">
          <AdminHeader />
          <main className="flex-1 p-4 pt-16 lg:p-6 lg:pt-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </AdminRefreshProvider>
  );
}
