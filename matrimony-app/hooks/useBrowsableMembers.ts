import { useMemo } from 'react';
import { getBrowsableMembersForUser } from '@/constants/memberDirectory';
import { resolveUserGender } from '@/constants/matchFilters';
import { useProfileForm } from '@/context/ProfileFormContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useUserApproval } from '@/context/UserApprovalContext';
import { useMemberDirectory } from '@/context/MemberDirectoryContext';

export function useBrowsableMembers() {
  const { published } = useMemberDirectory();
  const { values } = useProfileForm();
  const { canBrowseProfiles } = useUserApproval();
  const { hiddenProfileIds, canBrowseMemberProfiles } = useSubscription();
  const userGender = resolveUserGender(values);

  return useMemo(
    () => {
      if (!canBrowseMemberProfiles) {
        return [];
      }
      return getBrowsableMembersForUser(
        published,
        {
          registrationCommunity: values.registrationCommunity,
          gender: userGender,
        },
        'current-user',
        canBrowseProfiles,
        hiddenProfileIds,
      );
    },
    [canBrowseMemberProfiles, canBrowseProfiles, hiddenProfileIds, published, userGender, values.registrationCommunity],
  );
}
