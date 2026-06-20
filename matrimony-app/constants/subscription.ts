export const PROFILE_BATCH_SIZE = 20;
export const PROFILE_ACCESS_PRICE = 2000;
export const SUBSCRIPTION_STORAGE_KEY = 'user_subscription';

export function getProfilesAllowed(batchesPaid: number): number {
  return batchesPaid * PROFILE_BATCH_SIZE;
}

export function getProfilesRemaining(batchesPaid: number, viewedCount: number): number {
  return Math.max(0, getProfilesAllowed(batchesPaid) - viewedCount);
}

export function hasActivePaidBatch(accessMode: string, batchesPaid: number, viewedCount: number): boolean {
  return accessMode === 'paid' && batchesPaid > 0 && getProfilesRemaining(batchesPaid, viewedCount) > 0;
}
