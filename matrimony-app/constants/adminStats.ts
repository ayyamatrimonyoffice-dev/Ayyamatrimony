import type { AdminApprovalRecord } from '@/constants/adminMockData';
import { images } from '@/constants/images';
import type { PublishedMember } from '@/constants/memberDirectory';

export function computeAdminDashboardStats(
  published: PublishedMember[],
  approvals: AdminApprovalRecord[],
  unreadCount = 0,
) {
  const publishedIds = new Set(published.map((member) => member.id));
  const staticMembers = images.matches.filter((member) => !publishedIds.has(member.id));
  const totalUsers = staticMembers.length + published.length;

  const adminAdded = published.filter((entry) => entry.ownerKey.startsWith('admin-')).length;
  const pendingCount = approvals.filter((item) => item.status === 'pending').length;

  const verifiedStaticCount = staticMembers.filter((member) => member.verified).length;
  const activeToday = Math.min(totalUsers, verifiedStaticCount + published.length);

  return {
    totalUsers,
    adminAdded,
    pendingCount,
    unreadCount,
    activeToday,
  };
}
