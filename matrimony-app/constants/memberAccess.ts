import type { MemberProfile } from '@/constants/images';

/** Basic fields visible before payment; photos stay blurred. */
export function getLimitedMemberPreview(member: Pick<MemberProfile, 'name' | 'age' | 'community' | 'location' | 'image'>) {
  return {
    name: member.name,
    age: member.age,
    community: member.community,
    location: '—',
    image: member.image,
    occupation: '—',
    verified: false,
  };
}

export function hasFullMemberAccess(isPaidMember: boolean, canBrowseProfiles: boolean): boolean {
  return isPaidMember && canBrowseProfiles;
}
