import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AdminScreenShell } from '@/components/admin/AdminScreenShell';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminColors } from '@/constants/admin';

export default function AdminSettingsScreen() {
  const router = useRouter();
  const { signOut } = useAdminAuth();

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Leave the admin panel?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void signOut().then(() => router.replace('/admin/login'));
        },
      },
    ]);
  };

  return (
    <AdminScreenShell title="Settings" subtitle="Admin panel preferences">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Admin phone</Text>
            <Text style={styles.rowValue}>+91 9999999999</Text>
          </View>
          <MaterialIcons name="verified-user" size={20} color={adminColors.success} />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Firebase project</Text>
            <Text style={styles.rowValue}>matrimony-mobile-app-8541d</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preferences</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Approval alerts</Text>
          <Switch value trackColor={{ true: adminColors.primary, false: adminColors.border }} />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>New user alerts</Text>
          <Switch value trackColor={{ true: adminColors.primary, false: adminColors.border }} />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Email digest</Text>
          <Switch value={false} trackColor={{ true: adminColors.primary, false: adminColors.border }} />
        </View>
      </View>

      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <MaterialIcons name="logout" size={18} color="#fff" />
        <Text style={styles.signOutText}>Sign out of Admin</Text>
      </Pressable>
    </AdminScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
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
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    color: adminColors.text,
    fontSize: 14,
    fontWeight: '500',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: adminColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
  },
  signOutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
