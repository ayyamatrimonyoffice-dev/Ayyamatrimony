import { StyleSheet, Text, View } from 'react-native';
import { AdminListItem } from '@/components/admin/AdminListItem';
import { AdminScreenShell } from '@/components/admin/AdminScreenShell';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import {
  adminApprovals,
  adminDashboardStats,
  adminNotifications,
} from '@/constants/adminMockData';
import { adminColors } from '@/constants/admin';

export default function AdminDashboardScreen() {
  const pendingCount = adminApprovals.filter((item) => item.status === 'pending').length;
  const unreadCount = adminNotifications.filter((item) => !item.read).length;

  return (
    <AdminScreenShell
      title="Dashboard"
      subtitle="Overview of matrimony activity"
    >
      <View style={styles.statsGrid}>
        <AdminStatCard
          label="Total users"
          value={adminDashboardStats.totalUsers}
          icon="groups"
        />
        <AdminStatCard
          label="Pending approvals"
          value={pendingCount}
          icon="pending-actions"
          tone="warning"
        />
        <AdminStatCard
          label="Active today"
          value={adminDashboardStats.activeToday}
          icon="bolt"
          tone="success"
        />
        <AdminStatCard
          label="New registrations"
          value={adminDashboardStats.newRegistrations}
          icon="person-add"
          tone="default"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick summary</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            {pendingCount} profiles waiting for approval and {unreadCount} unread admin alerts.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent approvals</Text>
        {adminApprovals.slice(0, 3).map((item) => (
          <AdminListItem
            key={item.id}
            title={item.name}
            subtitle={item.phone}
            meta={`Submitted ${item.submittedAt}`}
            badge={item.status}
            badgeColor={
              item.status === 'pending'
                ? adminColors.warning
                : item.status === 'approved'
                  ? adminColors.success
                  : adminColors.danger
            }
          />
        ))}
      </View>
    </AdminScreenShell>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  section: {
    gap: 10,
    marginTop: 4,
  },
  sectionTitle: {
    color: adminColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: adminColors.primaryLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: `${adminColors.primary}22`,
  },
  summaryText: {
    color: adminColors.primaryDark,
    fontSize: 14,
    lineHeight: 20,
  },
});
