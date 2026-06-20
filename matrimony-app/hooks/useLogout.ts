import { useCallback } from 'react';
import { useSubscription } from '@/context/SubscriptionContext';

/** Ends the user session. Tabs layout shows the login screen when logged out. */
export function useLogout() {
  const { logout } = useSubscription();

  return useCallback(async () => {
    await logout();
  }, [logout]);
}
