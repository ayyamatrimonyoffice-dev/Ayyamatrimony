import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSubscription } from '@/context/SubscriptionContext';
import { useMemberAccess } from '@/hooks/useMemberAccess';

export function useOpenMemberProfile() {
  const router = useRouter();
  const {
    canOpenNewFullProfile,
    isPaidMember,
    isReady,
    recordProfileView,
  } = useSubscription();
  const { canSeeMemberProfiles, canViewFullProfile } = useMemberAccess();

  const openPayment = useCallback(
    (reason: 'initial' | 'batch') => {
      router.push({
        pathname: '/payment-access',
        params: { reason },
      });
    },
    [router],
  );

  return useCallback(
    (profileId: string) => {
      if (!isReady || !canSeeMemberProfiles) {
        return;
      }

      if (isPaidMember && !canOpenNewFullProfile(profileId)) {
        openPayment('batch');
        return;
      }

      if (canViewFullProfile(profileId)) {
        void recordProfileView(profileId);
      }

      router.push({ pathname: '/member/[id]', params: { id: profileId } });
    },
    [
      canOpenNewFullProfile,
      canSeeMemberProfiles,
      canViewFullProfile,
      isPaidMember,
      isReady,
      openPayment,
      recordProfileView,
      router,
    ],
  );
}

export function useRequirePaidContact() {
  const router = useRouter();
  const { isPaidMember, isReady, pendingPayment } = useSubscription();
  const { isProfileApproved, hasVerifiedPayment } = useMemberAccess();

  return useCallback(() => {
    if (!isReady) {
      return false;
    }

    if (!isProfileApproved) {
      return false;
    }

    if (!hasVerifiedPayment || pendingPayment || !isPaidMember) {
      router.push({
        pathname: '/payment-access',
        params: { reason: 'initial' },
      });
      return false;
    }

    return true;
  }, [hasVerifiedPayment, isPaidMember, isProfileApproved, isReady, pendingPayment, router]);
}
