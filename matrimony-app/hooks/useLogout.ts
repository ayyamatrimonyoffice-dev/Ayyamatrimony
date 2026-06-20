import { useCallback } from 'react';
import { useRouter, type Href } from 'expo-router';
import { useSubscription } from '@/context/SubscriptionContext';

/** Ends the session and navigates to the login screen. */
export function useLogout() {
  const router = useRouter();
  const { logout } = useSubscription();

  return useCallback(async () => {
    await logout();
    router.replace('/' as Href);
  }, [logout, router]);
}
