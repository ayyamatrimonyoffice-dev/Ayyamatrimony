import type { TranslationKey } from '@/constants/i18n';

export const adminFilterLabelKeys = {
  all: 'adminFilterAll',
  pending: 'adminFilterPending',
  approved: 'adminFilterApproved',
  rejected: 'adminFilterRejected',
  verified: 'adminFilterVerified',
  male: 'adminFilterMen',
  female: 'adminFilterWomen',
} as const satisfies Record<string, TranslationKey>;

export const adminStatusLabelKeys = {
  pending: 'adminStatusPending',
  approved: 'adminStatusApproved',
  rejected: 'adminStatusRejected',
  verified: 'adminStatusVerified',
  active: 'adminStatusActive',
  blocked: 'adminStatusBlocked',
} as const satisfies Record<string, TranslationKey>;

export function adminStatusLabelKey(status: string): TranslationKey {
  return adminStatusLabelKeys[status as keyof typeof adminStatusLabelKeys] ?? 'adminStatusPending';
}
