import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminScreenShell } from '@/components/admin/AdminScreenShell';
import { adminNotifications, type AdminNotificationRecord } from '@/constants/adminMockData';
import { adminColors } from '@/constants/admin';

export default function AdminNotificationsScreen() {
  const [items, setItems] = useState<AdminNotificationRecord[]>(adminNotifications);

  const unreadCount = items.filter((item) => !item.read).length;

  const markAllRead = () => {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
  };

  return (
    <AdminScreenShell
      title="Notifications"
      subtitle={`${unreadCount} unread alerts`}
      headerRight={
        unreadCount > 0 ? (
          <Pressable onPress={markAllRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </Pressable>
        ) : null
      }
    >
      {items.length === 0 ? (
        <AdminEmptyState
          icon="notifications-none"
          title="No notifications"
          message="Admin alerts will appear here when users register or submit profiles."
        />
      ) : (
        items.map((item) => (
          <View
            key={item.id}
            style={[styles.card, !item.read && styles.cardUnread]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {!item.read ? <View style={styles.dot} /> : null}
            </View>
            <Text style={styles.cardBody}>{item.body}</Text>
            <Text style={styles.cardTime}>{item.time}</Text>
          </View>
        ))
      )}
    </AdminScreenShell>
  );
}

const styles = StyleSheet.create({
  markAll: {
    color: adminColors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: adminColors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: adminColors.border,
    gap: 6,
  },
  cardUnread: {
    borderColor: `${adminColors.primary}44`,
    backgroundColor: adminColors.primaryLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    color: adminColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: adminColors.primary,
  },
  cardBody: {
    color: adminColors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  cardTime: {
    color: adminColors.textMuted,
    fontSize: 11,
  },
});
