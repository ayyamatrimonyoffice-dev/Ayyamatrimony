import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { colors, typography } from '@/constants/theme';

export default function TabLayout() {
  const { translate } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.surfaceTint,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: 'rgba(246, 250, 255, 0.95)',
          borderTopColor: 'rgba(226, 191, 185, 0.2)',
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          ...typography.labelSm,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: translate('home'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: translate('matches'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="favorite" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="interests"
        options={{
          title: translate('interests'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="star" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: translate('chat'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: translate('profile'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
