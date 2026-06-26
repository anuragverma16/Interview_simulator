import { useEffect, useState } from 'react';
import { ScrollText, Bell, UserCog, Trash2, RefreshCw } from 'lucide-react';
import { adminApi } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatDate, cn } from '../../utils/cn';
import { formatActionLabel } from './adminUtils';
import toast from 'react-hot-toast';

interface AdminLogEntry {
  _id: string;
  action: string;
  target: string;
  details?: Record<string, unknown>;
  createdAt: string;
  adminId?: { name: string; email: string };
}

const actionIcons: Record<string, typeof Bell> = {
  send_notification: Bell,
  update_user: UserCog,
  delete_user: Trash2,
};

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.getLogs()
      .then(({ data }) => setLogs(data.data || []))
      .catch(() => toast.error('Failed to load audit log'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <Card className="!p-0 overflow-hidden" hover={false}>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-purple-400" />
          <div>
            <h3 className="font-semibold">Audit log</h3>
            <p className="text-xs text-muted">Admin actions across the platform</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={load} loading={loading}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <div className="divide-y divide-white/5 max-h-[520px] overflow-y-auto">
        {loading && logs.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">Loading audit entries…</p>
        ) : logs.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No admin actions recorded yet</p>
        ) : (
          logs.map((log) => {
            const Icon = actionIcons[log.action] || ScrollText;
            return (
              <div key={log._id} className="flex gap-4 px-5 py-4 hover:bg-white/[0.02]">
                <div className={cn(
                  'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  log.action === 'delete_user' ? 'bg-red-500/15 text-red-400' :
                  log.action === 'send_notification' ? 'bg-purple-500/15 text-purple-400' :
                  'bg-cyan-500/15 text-cyan-400'
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{formatActionLabel(log.action)}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-muted">
                      {log.adminId?.name || 'Admin'}
                    </span>
                  </div>
                  {log.action === 'send_notification' && log.details?.title ? (
                    <p className="text-xs text-muted mt-1">
                      Sent &quot;{String(log.details.title)}&quot; to user {log.target.slice(-6)}
                    </p>
                  ) : (
                    <p className="text-xs text-muted mt-1">Target: {log.target || '—'}</p>
                  )}
                  <p className="text-[11px] text-muted/70 mt-1.5">{formatDate(log.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
