import type { AdminApprovalRecord, AdminUserRecord } from '@/constants/adminMockData';
import type { PublishedMember } from '@/constants/memberDirectory';

export function computeAdminDashboardStats(
  users: AdminUserRecord[],
  published: PublishedMember[],
  approvals: AdminApprovalRecord[],
  unreadCount = 0,
) {
  const totalUsers = users.length;
  const activeToday = users.filter((user) => user.status === 'active').length;
  const adminAdded = published.filter((entry) => entry.ownerKey.startsWith('admin-')).length;
  const pendingCount = approvals.filter((item) => item.status === 'pending').length;

  return {
    totalUsers,
    adminAdded,
    pendingCount,
    unreadCount,
    activeToday,
  };
}
