import { useCallback } from 'react';
import {
  canShowMemberDirectory,
  canUnlockMemberProfiles,
} from '@/constants/memberAccess';
import { useSubscription } from '@/context/SubscriptionContext';
import { useUserApproval } from '@/context/UserApprovalContext';

/**
 * Member browsing rules:
 * 1. Before admin approves the user's profile → no member list.
 * 2. After profile approval (paid or unpaid) → show members locked.
 * 3. After profile approval + admin verifies payment → unlock full profiles.
 */
export function useMemberAccess() {
  const { canBrowseProfiles, approvalStatus, isReady: approvalReady } = useUserApproval();
  const {
    isPaidMember,
    pendingPayment,
    hasChosenAccessMode,
    canViewFullProfile: canViewFullByQuota,
    canBrowseMemberProfiles,
    isReady: subscriptionReady,
  } = useSubscription();

  const isProfileApproved = canBrowseProfiles;
  const hasVerifiedPayment = isPaidMember && !pendingPayment;
  const canSeeMemberProfiles =
    canShowMemberDirectory(isProfileApproved, hasChosenAccessMode) && canBrowseMemberProfiles;
  const profilesAreLocked = canSeeMemberProfiles && !hasVerifiedPayment;

  const canViewFullProfile = useCallback(
    (profileId: string) => {
      if (!canUnlockMemberProfiles(isProfileApproved, isPaidMember, pendingPayment)) {
        return false;
      }
      return canViewFullByQuota(profileId);
    },
    [canViewFullByQuota, isPaidMember, isProfileApproved, pendingPayment],
  );

  return {
    isReady: approvalReady && subscriptionReady,
    isProfileApproved,
    hasVerifiedPayment,
    canSeeMemberProfiles,
    profilesAreLocked,
    canViewFullProfile,
    approvalStatus,
    pendingPayment,
    isPaidMember,
    hasChosenAccessMode,
  };
}
