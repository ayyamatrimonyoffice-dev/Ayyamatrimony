import { useCallback } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AdminListItem } from '@/components/admin/AdminListItem';
import { AdminScreenShell } from '@/components/admin/AdminScreenShell';
import type { AdminApprovalRecord } from '@/constants/adminMockData';
import { adminColors } from '@/constants/admin';
import { useAdminApprovals } from '@/context/AdminApprovalsContext';

export default function AdminApprovalsScreen() {
  const { items, updateStatus, refresh } = useAdminApprovals();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const updateItemStatus = (id: string, status: AdminApprovalRecord['status']) => {
    void updateStatus(id, status).then(() => {
      Alert.alert('Profile updated', `Profile marked as ${status}.`);
    });
  };

  return (
    <AdminScreenShell hideHeader>
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <AdminListItem
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
          {item.status === 'pending' ? (
            <View style={styles.actions}>
              <Pressable
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => updateItemStatus(item.id, 'approved')}
              >
                <Text style={styles.approveText}>Approve</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => updateItemStatus(item.id, 'rejected')}
              >
                <Text style={styles.rejectText}>Reject</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ))}
    </AdminScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  approveButton: {
    backgroundColor: `${adminColors.success}14`,
    borderColor: `${adminColors.success}55`,
  },
  rejectButton: {
    backgroundColor: `${adminColors.danger}10`,
    borderColor: `${adminColors.danger}44`,
  },
  approveText: {
    color: adminColors.success,
    fontWeight: '700',
    fontSize: 13,
  },
  rejectText: {
    color: adminColors.danger,
    fontWeight: '700',
    fontSize: 13,
  },
});
