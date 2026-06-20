import { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AdminScreenShell } from '@/components/admin/AdminScreenShell';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { ADMIN_PHONE, adminColors } from '@/constants/admin';

export default function AdminSettingsScreen() {
  const router = useRouter();
  const { signOut } = useAdminAuth();
  const { width: screenWidth } = useWindowDimensions();
  const contentMaxWidth = Math.min(screenWidth - 32, 520);
  const [approvalAlerts, setApprovalAlerts] = useState(true);
  const [newUserAlerts, setNewUserAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  const switchProps = {
    trackColor: { true: adminColors.primary, false: adminColors.border },
    thumbColor: Platform.OS === 'android' ? '#FFFFFF' : undefined,
    ios_backgroundColor: adminColors.border,
  } as const;

  const performSignOut = useCallback(async () => {
    await signOut();
    router.replace('/' as Href);
  }, [router, signOut]);

  const handleSignOut = useCallback(() => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Leave the admin panel?')) {
        void performSignOut();
      }
      return;
    }

    Alert.alert('Sign out', 'Leave the admin panel?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void performSignOut();
        },
      },
    ]);
  }, [performSignOut]);

  return (
    <AdminScreenShell title="Settings">
      <View style={[styles.content, { maxWidth: contentMaxWidth }]}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Admin phone</Text>
              <Text style={styles.rowValue} numberOfLines={1} adjustsFontSizeToFit>
                +91 {ADMIN_PHONE}
              </Text>
            </View>
            <MaterialIcons name="verified-user" size={20} color={adminColors.success} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferences</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel} numberOfLines={2}>
              Approval alerts
            </Text>
            <Switch
              {...switchProps}
              style={styles.switch}
              value={approvalAlerts}
              onValueChange={setApprovalAlerts}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel} numberOfLines={2}>
              New user alerts
            </Text>
            <Switch
              {...switchProps}
              style={styles.switch}
              value={newUserAlerts}
              onValueChange={setNewUserAlerts}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel} numberOfLines={2}>
              Email digest
            </Text>
            <Switch
              {...switchProps}
              style={styles.switch}
              value={emailDigest}
              onValueChange={setEmailDigest}
            />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.signOutButton, pressed && styles.signOutButtonPressed]}
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out of Admin"
        >
          <MaterialIcons name="logout" size={18} color="#fff" />
          <Text style={styles.signOutText}>Sign out of Admin</Text>
        </Pressable>
      </View>
    </AdminScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    alignSelf: 'center',
    gap: 12,
  },
  card: {
    width: '100%',
    backgroundColor: adminColors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: adminColors.border,
    gap: 12,
  },
  cardTitle: {
    color: adminColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 44,
  },
  rowText: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  rowLabel: {
    flex: 1,
    flexShrink: 1,
    color: adminColors.text,
    fontSize: 14,
    fontWeight: '500',
    paddingRight: 8,
  },
  switch: {
    flexShrink: 0,
  },
  rowValue: {
    color: adminColors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: adminColors.border,
  },
  signOutButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: adminColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 72,
    zIndex: 2,
  },
  signOutButtonPressed: {
    opacity: 0.92,
  },
  signOutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
