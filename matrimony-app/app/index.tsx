import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { LoginLandingScreen } from '@/components/LoginLandingScreen';
import { hasCompletedProfile } from '@/constants/profileCompletion';
import { colors } from '@/constants/theme';
import { useProfileForm } from '@/context/ProfileFormContext';
import { useSubscription } from '@/context/SubscriptionContext';

export default function Index() {
  const { isReady: subscriptionReady, isLoggedIn, needsPaymentAccess, isSubscriptionGateReady } =
    useSubscription();
  const { values, isReady: profileReady } = useProfileForm();

  if (!subscriptionReady || !profileReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
        }}
      >
        <ActivityIndicator size="large" color={colors.secondaryFixed} />
      </View>
    );
  }

  if (isLoggedIn && hasCompletedProfile(values)) {
    if (!isSubscriptionGateReady) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    if (needsPaymentAccess) {
      return <Redirect href="/payment-access" />;
    }
    return <Redirect href="/(tabs)" />;
  }

  return <LoginLandingScreen />;
}
