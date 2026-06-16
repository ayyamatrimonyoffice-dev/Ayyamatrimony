import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminColors } from '@/constants/admin';

export default function AdminIndexScreen() {
  const router = useRouter();
  const { isReady, isAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (isAuthenticated) {
      router.replace('/admin/(tabs)/' as Href);
      return;
    }
    router.replace('/admin/login');
  }, [isAuthenticated, isReady, router]);

  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={adminColors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: adminColors.background,
  },
});
