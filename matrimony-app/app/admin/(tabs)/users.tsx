import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AdminListItem } from '@/components/admin/AdminListItem';
import { AdminScreenShell } from '@/components/admin/AdminScreenShell';
import { adminUsers, type AdminUserRecord } from '@/constants/adminMockData';
import { adminColors } from '@/constants/admin';

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

  const filteredUsers = useMemo(() => {
    if (filter === 'all') {
      return adminUsers;
    }
    return adminUsers.filter((user) => user.status === filter);
  }, [filter]);

  return (
    <AdminScreenShell title="User Management" subtitle={`${adminUsers.length} registered users`}>
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

      <View style={styles.list}>
        {filteredUsers.map((user) => (
          <AdminListItem
            key={user.id}
            title={user.name}
            subtitle={`${user.phone} · ${user.id}`}
            meta={`Registered ${user.registeredAt}`}
            badge={user.status}
            badgeColor={statusColor[user.status]}
          />
        ))}
      </View>
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
  list: {
    gap: 10,
    marginTop: 4,
  },
});
