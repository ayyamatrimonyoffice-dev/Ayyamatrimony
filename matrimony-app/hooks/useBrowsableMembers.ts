import { useMemo } from 'react';
import { getBrowsableMembersForUser } from '@/constants/memberDirectory';
import { resolveUserGender } from '@/constants/matchFilters';
import { useProfileForm } from '@/context/ProfileFormContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useMemberAccess } from '@/hooks/useMemberAccess';
import { useMemberDirectory } from '@/context/MemberDirectoryContext';

export function useBrowsableMembers() {
  const { published } = useMemberDirectory();
  const { values } = useProfileForm();
  const { hiddenProfileIds } = useSubscription();
  const { canSeeMemberProfiles } = useMemberAccess();
  const userGender = resolveUserGender(values);

  return useMemo(
    () => {
      if (!canSeeMemberProfiles) {
        return [];
      }
      return getBrowsableMembersForUser(
        published,
        {
          registrationCommunity: values.registrationCommunity,
          gender: userGender,
        },
        'current-user',
        true,
        hiddenProfileIds,
      );
    },
    [canSeeMemberProfiles, hiddenProfileIds, published, userGender, values.registrationCommunity],
  );
}
