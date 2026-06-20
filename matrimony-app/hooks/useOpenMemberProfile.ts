import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSubscription } from '@/context/SubscriptionContext';

export function useOpenMemberProfile() {
  const router = useRouter();
  const { canOpenNewFullProfile, isPaidMember, recordProfileView } = useSubscription();

  return useCallback(
    (profileId: string) => {
      if (isPaidMember && !canOpenNewFullProfile(profileId)) {
        router.push({
          pathname: '/payment-access',
          params: { reason: 'batch' },
        });
        return;
      }

      if (isPaidMember) {
        void recordProfileView(profileId);
      }

      router.push({ pathname: '/member/[id]', params: { id: profileId } });
    },
    [canOpenNewFullProfile, isPaidMember, recordProfileView, router],
  );
}
