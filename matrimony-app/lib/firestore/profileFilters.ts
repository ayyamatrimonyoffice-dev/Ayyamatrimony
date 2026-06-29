import type { FirestoreProfileDoc } from '@/lib/firestore/collections';

export function collectDeletedProfilePhones(profiles: FirestoreProfileDoc[]): Set<string> {
  const deleted = new Set<string>();
  for (const profile of profiles) {
    if (profile.accountStatus !== 'deleted') {
      continue;
    }
    const phone = profile.phone?.replace(/\D/g, '') ?? '';
    if (phone) {
      deleted.add(phone);
    }
  }
  return deleted;
}

export function isDeletedProfilePhone(phone: string, deletedPhones: Set<string>): boolean {
  const digits = phone.replace(/\D/g, '');
  return Boolean(digits && deletedPhones.has(digits));
}
