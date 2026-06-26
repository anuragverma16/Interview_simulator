import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import AdminUsersTable, { type AdminUserRow } from '../../components/admin/AdminUsersTable';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { AdminPage } from '../../components/admin/AdminMotion';
import { useAdminRefresh } from '../../contexts/AdminRefreshContext';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { refreshKey } = useAdminRefresh();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const { data } = await adminApi.getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page: pageNum,
        limit: 15,
      });
      setUsers(data.data.users);
      setTotal(data.data.total);
      setPage(data.data.page);
      setPages(data.data.pages);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(1); }, [refreshKey]);

  const toggleUser = async (user: AdminUserRow) => {
    try {
      await adminApi.updateUser(user._id, { isActive: user.isActive === false });
      toast.success(user.isActive === false ? 'User activated' : 'User suspended');
      fetchUsers(page);
    } catch {
      toast.error('Update failed');
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Permanently delete this user?')) return;
    try {
      await adminApi.deleteUser(id);
      toast.success('User deleted');
      fetchUsers(page);
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading && users.length === 0) return <DashboardSkeleton />;

  return (
    <AdminPage>
      <AdminUsersTable
      users={users}
      total={total}
      page={page}
      pages={pages}
      search={search}
      roleFilter={roleFilter}
      statusFilter={statusFilter}
      loading={loading}
      onSearchChange={setSearch}
      onRoleFilterChange={setRoleFilter}
      onStatusFilterChange={setStatusFilter}
      onSearch={() => fetchUsers(1)}
      onPageChange={(p) => fetchUsers(p)}
      onViewUser={(id, tab) => navigate(tab === 'notify' ? `/admin/users/${id}?tab=notify` : `/admin/users/${id}`)}
      onToggleActive={toggleUser}
      onDeleteUser={deleteUser}
      variant="admin"
    />
    </AdminPage>
  );
}
