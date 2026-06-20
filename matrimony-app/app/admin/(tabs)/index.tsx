import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AdminListItem } from '@/components/admin/AdminListItem';
import { AdminScreenShell } from '@/components/admin/AdminScreenShell';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { computeAdminDashboardStats } from '@/constants/adminStats';
import type { AdminUserRecord } from '@/constants/adminMockData';
import { adminColors } from '@/constants/admin';
import { useAdminApprovals } from '@/context/AdminApprovalsContext';
import { useAdminNotifications } from '@/context/AdminNotificationsContext';
import { useMemberDirectory } from '@/hooks/useMemberDirectory';
import { listAdminUsers } from '@/lib/firestore/adminUserService';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { published, refresh } = useMemberDirectory();
  const { items: approvals, refresh: refreshApprovals } = useAdminApprovals();
  const { unreadCount } = useAdminNotifications();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);

  const refreshUsers = useCallback(async () => {
    const entries = await listAdminUsers();
    setUsers(entries);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void refreshApprovals();
      void refreshUsers();
    }, [refresh, refreshApprovals, refreshUsers]),
  );

  const stats = useMemo(
    () => computeAdminDashboardStats(users, published, approvals, unreadCount),
    [approvals, published, unreadCount, users],
  );

  return (
    <AdminScreenShell
      title="Dashboard"
      showLogo
      headerRight={
          <Pressable
            style={styles.notificationBtn}
            onPress={() => router.push('/admin/notifications')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <View style={styles.notificationIconWrap}>
              <MaterialIcons name="notifications-none" size={24} color={adminColors.text} />
              {stats.unreadCount > 0 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {stats.unreadCount > 9 ? '9+' : stats.unreadCount}
                  </Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        }
      >
        <View style={styles.statsGrid}>
          <AdminStatCard
            label="Total users"
            value={stats.totalUsers}
            icon="groups"
          />
          <AdminStatCard
            label="Pending approvals"
            value={stats.pendingCount}
            icon="pending-actions"
            tone="warning"
          />
          <AdminStatCard
            label="Active users"
            value={stats.activeToday}
            icon="bolt"
            tone="success"
          />
          <AdminStatCard
            label="Admin added"
            value={stats.adminAdded}
            icon="person-add"
            tone="default"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent approvals</Text>
          {approvals.slice(0, 3).map((item) => (
            <AdminListItem
              key={item.id}
              title={item.name}
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
    gap: 8,
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
  notificationBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIconWrap: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: adminColors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },
});
