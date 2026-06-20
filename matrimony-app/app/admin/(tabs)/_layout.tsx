import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { Redirect, Tabs, useRouter, useSegments } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminFab } from '@/components/admin/AdminFab';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminColors, adminTabs, getAdminTabBarMetrics } from '@/constants/admin';

const TAB_ICON_SIZE = 22;

export default function AdminTabsLayout() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const { isReady, isAuthenticated } = useAdminAuth();
  const isSettingsTab = segments[segments.length - 1] === 'settings';
  const tabBarMetrics = getAdminTabBarMetrics(insets.bottom);

  if (!isReady) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={adminColors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }



  const tabBarStyle = Platform.select({

    web: {

      backgroundColor: adminColors.surface,

      borderTopColor: adminColors.border,

      borderTopWidth: 1,

      paddingTop: tabBarMetrics.paddingTop,

      paddingBottom: tabBarMetrics.paddingBottom,

      minHeight: tabBarMetrics.height,

    },

    default: {

      backgroundColor: adminColors.surface,

      borderTopColor: adminColors.border,

      borderTopWidth: 1,

      paddingTop: tabBarMetrics.paddingTop,

      paddingBottom: tabBarMetrics.paddingBottom,

      height: tabBarMetrics.height,

    },

  });



  return (

    <View style={styles.shell}>

      <View style={styles.tabsHost}>

        <Tabs

          screenOptions={{

            headerShown: false,

            tabBarActiveTintColor: adminColors.primary,

            tabBarInactiveTintColor: adminColors.textMuted,

            tabBarStyle,

            tabBarLabelStyle: styles.tabLabel,

            safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },

            sceneContainerStyle: styles.scene,

          }}

        >

          <Tabs.Screen

            name="index"

            options={{

              title: adminTabs.dashboard,

              tabBarIcon: ({ color }) => (

                <MaterialIcons name="dashboard" size={TAB_ICON_SIZE} color={color} />

              ),

            }}

          />

          <Tabs.Screen

            name="users"

            options={{

              title: adminTabs.users,

              tabBarIcon: ({ color }) => (

                <MaterialIcons name="people" size={TAB_ICON_SIZE} color={color} />

              ),

            }}

          />

          <Tabs.Screen

            name="approvals"

            options={{

              title: adminTabs.approvals,

              tabBarIcon: ({ color }) => (

                <MaterialIcons name="fact-check" size={TAB_ICON_SIZE} color={color} />

              ),

            }}

          />

          <Tabs.Screen

            name="settings"

            options={{

              title: adminTabs.settings,

              tabBarIcon: ({ color }) => (

                <MaterialIcons name="settings" size={TAB_ICON_SIZE} color={color} />

              ),

            }}

          />

        </Tabs>

      </View>

      {!isSettingsTab ? <AdminFab onPress={() => router.push('/admin/add-member')} /> : null}

    </View>

  );

}



const styles = StyleSheet.create({

  shell: {

    flex: 1,

    minHeight: 0,

    overflow: 'visible',

  },

  tabsHost: {

    flex: 1,

    minHeight: 0,

    ...Platform.select({

      web: {

        height: '100%',

      },

      default: {},

    }),

  },

  scene: {

    backgroundColor: adminColors.background,

  },

  loader: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: adminColors.background,

  },

  tabLabel: {

    fontSize: 10,

    fontWeight: '600',

    lineHeight: 12,

    marginTop: 2,

  },

});


