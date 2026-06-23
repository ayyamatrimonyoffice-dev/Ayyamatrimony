import { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import { Redirect, Tabs, useFocusEffect, useRouter, type Href } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LoginLandingScreen } from '@/components/LoginLandingScreen';
import { useLanguage } from '@/context/LanguageContext';
import { useProfileForm } from '@/context/ProfileFormContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useUserApproval } from '@/context/UserApprovalContext';
import { hasCompletedProfile } from '@/constants/profileCompletion';
import { CONTACT_PHONE_KEY } from '@/constants/contactDetails';
import { useMemberDirectory } from '@/context/MemberDirectoryContext';
import { images } from '@/constants/images';
import { colors, typography } from '@/constants/theme';

export default function TabLayout() {
  const router = useRouter();
  const { translate } = useLanguage();
  const { isReady, isLoggedIn, needsPaymentAccess, syncFromFirestore } = useSubscription();
  const { values, isReady: profileReady } = useProfileForm();
  const { refresh: refreshApproval } = useUserApproval();
  const { refresh: refreshDirectory } = useMemberDirectory();
  const sentToRegistration = useRef(false);
  const phone = values[CONTACT_PHONE_KEY]?.replace(/\D/g, '') ?? '';

  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn) {
        return;
      }

      void refreshApproval();
      void refreshDirectory();
      if (phone) {
        void syncFromFirestore(phone);
      }
    }, [isLoggedIn, phone, refreshApproval, refreshDirectory, syncFromFirestore]),
  );

  const profileComplete = hasCompletedProfile(values);

  useEffect(() => {
    if (!isLoggedIn) {
      sentToRegistration.current = false;
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isReady || !profileReady || !isLoggedIn || profileComplete) {
      return;
    }
    if (sentToRegistration.current) {
      return;
    }
    sentToRegistration.current = true;
    router.replace('/create-profile' as Href);
  }, [isLoggedIn, isReady, profileComplete, profileReady, router]);

  if (!isReady || !profileReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <LoginLandingScreen />;
  }

  if (!profileComplete) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (needsPaymentAccess) {
    return <Redirect href="/payment-access" />;
  }

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
          tabBarIcon: ({ focused }) => (
            <Image
              source={images.logo}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                opacity: focused ? 1 : 0.65,
              }}
              resizeMode="cover"
            />
          ),
        }}
      />
    </Tabs>
  );
}
