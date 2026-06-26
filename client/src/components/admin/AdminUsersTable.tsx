import {
  Search, Eye, Bell, Ban, CheckCircle, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import Input, { Select } from '../ui/Input';
import { formatDate, cn } from '../../utils/cn';

import { userInitials } from './adminUtils';

export interface AdminUserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
  createdAt: string;
  lastLogin?: string;
  stats?: { xp: number; level?: number };
}

interface Props {
  users: AdminUserRow[];
  total: number;
  page: number;
  pages: number;
  search: string;
  roleFilter: string;
  statusFilter: string;
  loading: boolean;
  onSearchChange: (v: string) => void;
  onRoleFilterChange: (v: string) => void;
  onStatusFilterChange: (v: string) => void;
  onSearch: () => void;
  onPageChange: (p: number) => void;
  onViewUser: (id: string, tab?: 'profile' | 'notify') => void;
  onToggleActive: (user: AdminUserRow) => void;
  onDeleteUser: (id: string) => void;
  variant?: 'default' | 'admin';
}

export default function AdminUsersTable({
  users, total, page, pages, search, roleFilter, statusFilter, loading,
  onSearchChange, onRoleFilterChange, onStatusFilterChange, onSearch, onPageChange,
  onViewUser, onToggleActive, onDeleteUser, variant = 'default',
}: Props) {
  const shell = variant === 'admin' ? 'admin-card' : 'glass rounded-2xl';
  return (
    <div className={cn(shell, '!p-0 overflow-hidden admin-card-glow')}>
      <div className="border-b border-white/10 p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-lg">User management</h3>
          <p className="text-xs text-muted mt-0.5">{total} users · search, filter, and send individual notifications</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder="Search by name or email…"
              className="!pl-10"
            />
          </div>
          <Select value={roleFilter} onChange={(e) => onRoleFilterChange(e.target.value)} className="lg:w-36">
            <option value="">All roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </Select>
          <Select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} className="lg:w-36">
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Suspended</option>
          </Select>
          <Button variant="secondary" onClick={onSearch} loading={loading}>
            Apply
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-muted border-b border-white/10 bg-white/[0.02]">
              <th className="text-left py-3 px-4 font-medium">User</th>
              <th className="text-left py-3 px-4 font-medium">Role</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">XP</th>
              <th className="text-left py-3 px-4 font-medium">Joined</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted">No users match your filters</td>
              </tr>
            ) : (
              users.map((u, i) => (
                <motion.tr
                  key={u._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 hover:bg-amber-500/[0.03] transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 font-semibold text-sm text-amber-300">
                        {userInitials(u.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      'inline-flex text-xs font-medium px-2.5 py-1 rounded-full',
                      u.role === 'admin' ? 'bg-red-500/15 text-red-300 border border-red-500/25' : 'bg-white/5 text-muted border border-white/10'
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full',
                      u.isActive !== false ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
                    )}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', u.isActive !== false ? 'bg-emerald-400' : 'bg-amber-400')} />
                      {u.isActive !== false ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-3 px-4 tabular-nums">
                    <span className="font-medium">{u.stats?.xp ?? 0}</span>
                    <span className="text-muted text-xs ml-1">Lv.{u.stats?.level ?? 1}</span>
                  </td>
                  <td className="py-3 px-4 text-muted text-xs">{formatDate(u.createdAt)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        title="View details"
                        onClick={() => onViewUser(u._id, 'profile')}
                        className="p-2 rounded-lg hover:bg-white/10 text-muted hover:text-themed transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Send notification"
                        onClick={() => onViewUser(u._id, 'notify')}
                        className="p-2 rounded-lg hover:bg-amber-500/15 text-muted hover:text-amber-400 transition-colors"
                      >
                        <Bell className="h-4 w-4" />
                      </button>
                      {u.role !== 'admin' && (
                        <>
                          <button
                            type="button"
                            title={u.isActive !== false ? 'Suspend user' : 'Activate user'}
                            onClick={() => onToggleActive(u)}
                            className="p-2 rounded-lg hover:bg-amber-500/15 text-muted hover:text-amber-400 transition-colors"
                          >
                            {u.isActive !== false ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                          <button
                            type="button"
                            title="Delete user"
                            onClick={() => onDeleteUser(u._id)}
                            className="p-2 rounded-lg hover:bg-red-500/15 text-muted hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
          <p className="text-xs text-muted">
            Page {page} of {pages} · {total} total
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
