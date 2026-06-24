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

/** User finished subscription step and admin approved their profile. */
export function canShowMemberDirectory(
  isProfileApproved: boolean,
  hasChosenAccessMode: boolean,
): boolean {
  return isProfileApproved && hasChosenAccessMode;
}

/** Admin verified payment — full biodata/photos can unlock (quota still applies). */
export function canUnlockMemberProfiles(
  isProfileApproved: boolean,
  isPaidMember: boolean,
  pendingPayment: boolean,
): boolean {
  return isProfileApproved && isPaidMember && !pendingPayment;
}
