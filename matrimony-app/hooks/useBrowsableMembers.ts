import { useMemo } from 'react';
import { getBrowsableMembersForUser } from '@/constants/memberDirectory';
import { resolveUserGender } from '@/constants/matchFilters';
import { useProfileForm } from '@/context/ProfileFormContext';
import { useUserApproval } from '@/context/UserApprovalContext';
import { useMemberDirectory } from '@/hooks/useMemberDirectory';

export function useBrowsableMembers() {
  const { published } = useMemberDirectory();
  const { values } = useProfileForm();
  const { canBrowseProfiles } = useUserApproval();
  const userGender = resolveUserGender(values);

  return useMemo(
    () =>
      getBrowsableMembersForUser(
        published,
        {
          registrationCommunity: values.registrationCommunity,
          gender: userGender,
        },
        'current-user',
        canBrowseProfiles,
      ),
    [canBrowseProfiles, published, userGender, values.registrationCommunity],
  );
}
