import { Redirect } from 'expo-router';
import { LoginLandingScreen } from '@/components/LoginLandingScreen';
import { hasCompletedProfile } from '@/constants/profileCompletion';
import { useProfileForm } from '@/context/ProfileFormContext';
import { useSubscription } from '@/context/SubscriptionContext';

export default function Index() {
  const { isReady: subscriptionReady, isLoggedIn, needsPaymentAccess, isSubscriptionGateReady } =
    useSubscription();
  const { values, isReady: profileReady } = useProfileForm();

  if (!subscriptionReady || !profileReady) {
    return null;
  }

  if (isLoggedIn && hasCompletedProfile(values)) {
    if (!isSubscriptionGateReady) {
      return null;
    }
    if (needsPaymentAccess) {
      return <Redirect href="/payment-access" />;
    }
    return <Redirect href="/(tabs)" />;
  }

  return <LoginLandingScreen />;
}
