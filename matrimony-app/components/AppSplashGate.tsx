import { ReactNode, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useProfileForm } from '@/context/ProfileFormContext';
import { useSubscription } from '@/context/SubscriptionContext';

type AppSplashGateProps = {
  children: ReactNode;
  fontsReady: boolean;
};

/** Keep the native splash visible until fonts and local storage are ready. */
export function AppSplashGate({ children, fontsReady }: AppSplashGateProps) {
  const { isReady: profileReady } = useProfileForm();
  const { isReady: subscriptionReady } = useSubscription();

  useEffect(() => {
    if (fontsReady && profileReady && subscriptionReady) {
      void SplashScreen.hideAsync();
    }
  }, [fontsReady, profileReady, subscriptionReady]);

  if (!fontsReady || !profileReady || !subscriptionReady) {
    return null;
  }

  return children;
}
