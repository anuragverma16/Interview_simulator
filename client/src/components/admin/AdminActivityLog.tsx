import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, UserCog, Trash2, ScrollText } from 'lucide-react';
import { adminApi } from '../../services/api';
import { formatDate } from '../../utils/cn';
import { cn } from '../../utils/cn';
import { useAdminRefresh } from '../../contexts/AdminRefreshContext';
import { AdminPage } from './AdminMotion';

interface AdminLogEntry {
  _id: string;
  action: string;
  target: string;
  details?: Record<string, unknown>;
  createdAt: string;
  adminId?: { name: string; email: string };
}

const actionMeta: Record<string, { label: string; icon: typeof Bell; color: string }> = {
  send_notification: { label: 'Notification sent', icon: Bell, color: 'text-amber-400 bg-amber-500/15' },
  schedule_daily_problem: { label: 'Daily problem scheduled', icon: Bell, color: 'text-orange-400 bg-orange-500/15' },
  publish_daily_problem: { label: 'Daily problem published', icon: Bell, color: 'text-emerald-400 bg-emerald-500/15' },
  update_user: { label: 'User updated', icon: UserCog, color: 'text-cyan-400 bg-cyan-500/15' },
  delete_user: { label: 'User deleted', icon: Trash2, color: 'text-red-400 bg-red-500/15' },
};

export default function AdminActivityLog({ variant = 'default' }: { variant?: 'default' | 'admin' }) {
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useAdminRefresh();
  const shell = variant === 'admin' ? 'admin-card admin-card-glow' : 'glass rounded-2xl';

  useEffect(() => {
    setLoading(true);
    adminApi.getLogs()
      .then(({ data }) => setLogs(data.data || []))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const content = (
    <div className={cn(shell, '!p-0 overflow-hidden')}>
      <div className={cn('border-b px-5 py-4 flex items-center gap-2', variant === 'admin' ? 'border-amber-500/10' : 'border-white/10')}>
        <ScrollText className={cn('h-5 w-5', variant === 'admin' ? 'text-amber-400' : 'text-purple-400')} />
        <div>
          <h3 className="font-semibold">Audit trail</h3>
          <p className="text-xs text-muted">{logs.length} recorded actions</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted text-sm admin-shimmer">Loading activity…</div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center text-muted text-sm">No admin activity recorded yet</div>
      ) : (
        <div className="divide-y divide-white/5 max-h-[calc(100vh-220px)] overflow-y-auto admin-scrollbar">
          {logs.map((log, i) => {
            const meta = actionMeta[log.action] || { label: log.action, icon: ScrollText, color: 'text-white/60 bg-white/10' };
            const Icon = meta.icon;
            return (
              <motion.div
                key={log._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="flex gap-4 px-5 py-4 hover:bg-amber-500/[0.03] transition-colors"
              >
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', meta.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{meta.label}</p>
                  <p className="text-xs text-muted mt-0.5">
                    by {log.adminId?.name || 'Admin'}
                    {log.details?.title ? ` · "${String(log.details.title)}"` : ''}
                  </p>
                  {log.target && (
                    <p className="text-[10px] text-muted/70 mt-1 font-mono truncate">Target: {log.target}</p>
                  )}
                </div>
                <span className="text-xs text-muted shrink-0">{formatDate(log.createdAt)}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (variant === 'admin') return <AdminPage>{content}</AdminPage>;
  return content;
}
