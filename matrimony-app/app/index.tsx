import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { LoginLandingScreen } from '@/components/LoginLandingScreen';
import { readAdminSession } from '@/constants/admin';
import { hasCompletedProfile } from '@/constants/profileCompletion';
import { useProfileForm } from '@/context/ProfileFormContext';
import { useSubscription } from '@/context/SubscriptionContext';

export default function Index() {
  const { isReady: subscriptionReady, isLoggedIn, needsPaymentAccess, isSubscriptionGateReady } =
    useSubscription();
  const { values, isReady: profileReady } = useProfileForm();
  const [adminSessionReady, setAdminSessionReady] = useState(false);
  const [hasAdminSession, setHasAdminSession] = useState(false);

  useEffect(() => {
    let mounted = true;
    void readAdminSession().then((authenticated) => {
      if (mounted) {
        setHasAdminSession(authenticated);
        setAdminSessionReady(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!subscriptionReady || !profileReady || !adminSessionReady) {
    return null;
  }

  if (hasAdminSession) {
    return <Redirect href="/admin/(tabs)" />;
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
