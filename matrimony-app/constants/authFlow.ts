import { CONTACT_PHONE_KEY, normalizePhoneDigits } from '@/constants/contactDetails';
import { hasCompletedProfile } from '@/constants/profileCompletion';

export function profilePhone(values: Record<string, string>): string {
  return normalizePhoneDigits(values[CONTACT_PHONE_KEY] ?? values.phoneNumber ?? '');
}

export function mergeLoginProfile(
  localProfile: Record<string, string>,
  remoteProfile: Record<string, string> | null,
  phone: string,
): Record<string, string> {
  const sameLocalPhone = profilePhone(localProfile) === phone;

  return {
    ...(sameLocalPhone ? localProfile : {}),
    ...(remoteProfile ?? {}),
    [CONTACT_PHONE_KEY]: phone,
    whatsappNumber: remoteProfile?.whatsappNumber || localProfile.whatsappNumber || phone,
  };
}

export function phoneOnlyProfile(phone: string): Record<string, string> {
  return {
    [CONTACT_PHONE_KEY]: phone,
    whatsappNumber: phone,
  };
}

/** True when this phone already has a finished profile locally or in Firestore. */
export function isReturningUser(
  phone: string,
  localProfile: Record<string, string>,
  remoteProfile: Record<string, string> | null,
): boolean {
  const merged = mergeLoginProfile(localProfile, remoteProfile, phone);
  return hasCompletedProfile(merged);
}
