import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminListItem } from '@/components/admin/AdminListItem';
import { AdminScreenShell } from '@/components/admin/AdminScreenShell';
import type { AdminUserRecord } from '@/constants/adminMockData';
import { adminColors } from '@/constants/admin';
import { listAdminUsers } from '@/lib/firestore/adminUserService';

type Filter = 'all' | AdminUserRecord['status'];

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending' },
  { key: 'blocked', label: 'Blocked' },
];

const statusColor: Record<AdminUserRecord['status'], string> = {
  active: adminColors.success,
  pending: adminColors.warning,
  blocked: adminColors.danger,
};

export default function AdminUsersScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const entries = await listAdminUsers();
      setUsers(entries);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const filteredUsers = useMemo(() => {
    if (filter === 'all') {
      return users;
    }
    return users.filter((user) => user.status === filter);
  }, [filter, users]);

  return (
    <AdminScreenShell title="User Management">
      <View style={styles.filters}>
        {filters.map((item) => {
          const active = filter === item.key;
          return (
            <Pressable
              key={item.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(item.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={adminColors.primary} />
        </View>
      ) : filteredUsers.length === 0 ? (
        <AdminEmptyState
          icon="groups"
          title="No users yet"
          message={
            filter === 'all'
              ? 'Registered members will appear here after they sign up.'
              : `No ${filter} users right now.`
          }
        />
      ) : (
        <View style={styles.list}>
          {filteredUsers.map((user) => (
            <AdminListItem
              key={user.phone}
              title={user.name}
              subtitle={user.phone}
              meta={`Registered ${user.registeredAt}`}
              badge={user.status}
              badgeColor={statusColor[user.status]}
            />
          ))}
        </View>
      )}
    </AdminScreenShell>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.border,
  },
  chipActive: {
    backgroundColor: adminColors.primary,
    borderColor: adminColors.primary,
  },
  chipText: {
    color: adminColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  loading: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  list: {
    gap: 10,
    marginTop: 4,
  },
});
