import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminColors, adminTabs } from '@/constants/admin';

export default function AdminTabsLayout() {
  const router = useRouter();
  const { isReady, isAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (!isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isReady, router]);

  if (!isReady || !isAuthenticated) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={adminColors.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: adminColors.primary,
        tabBarInactiveTintColor: adminColors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: adminTabs.dashboard,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: adminTabs.users,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: adminTabs.approvals,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="fact-check" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: adminTabs.notifications,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: adminTabs.settings,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: adminColors.background,
  },
  tabBar: {
    backgroundColor: adminColors.surface,
    borderTopColor: adminColors.border,
    height: 62,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
