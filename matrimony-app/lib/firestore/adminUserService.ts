import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { AdminUserRecord } from '@/constants/adminMockData';
import { isAdminPhone } from '@/constants/admin';
import { getFirebaseFirestore } from '@/lib/firebase';
import { resolveUserApprovalStatus } from '@/lib/firestore/approvalService';
import {
  FIRESTORE_COLLECTIONS,
  type FirestoreApprovalDoc,
  type FirestoreProfileDoc,
} from '@/lib/firestore/collections';
import { fetchSubscription } from '@/lib/firestore/subscriptionService';

function formatRegisteredDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function mapApprovalToUserStatus(
  status: FirestoreApprovalDoc['status'] | null,
  accountStatus?: FirestoreProfileDoc['accountStatus'],
): AdminUserRecord['status'] {
  if (accountStatus === 'blocked') {
    return 'blocked';
  }
  if (status === 'approved') {
    return 'active';
  }
  if (status === 'rejected') {
    return 'blocked';
  }
  return 'pending';
}

export async function listAdminUsers(): Promise<AdminUserRecord[]> {
  const db = await getFirebaseFirestore();
  if (!db) {
    return [];
  }

  const [profileSnapshot, approvalSnapshot] = await Promise.all([
    getDocs(collection(db, FIRESTORE_COLLECTIONS.profiles)),
    getDocs(query(collection(db, FIRESTORE_COLLECTIONS.approvals), orderBy('updatedAt', 'desc'))),
  ]);

  const approvalsByPhone = new Map<string, FirestoreApprovalDoc>();
  for (const entry of approvalSnapshot.docs) {
    const data = entry.data() as FirestoreApprovalDoc;
    if (!isAdminPhone(data.phone)) {
      approvalsByPhone.set(data.phone, data);
    }
  }

  const usersByPhone = new Map<string, AdminUserRecord & { sortTime: number }>();

  for (const entry of profileSnapshot.docs) {
    const profile = entry.data() as FirestoreProfileDoc;
    if (!profile.phone || isAdminPhone(profile.phone) || profile.accountStatus === 'deleted') {
      continue;
    }

    const approval = approvalsByPhone.get(profile.phone);
    const approvalStatus = resolveUserApprovalStatus(approval?.status, profile.approvalStatus);
    const subscription = await fetchSubscription(profile.phone).catch(() => null);

    usersByPhone.set(profile.phone, {
      id: profile.profileId,
      name: profile.fullName?.trim() || profile.listing?.name?.trim() || `Member ${profile.phone.slice(-4)}`,
      phone: profile.phone,
      status: mapApprovalToUserStatus(approvalStatus, profile.accountStatus),
      registeredAt: formatRegisteredDate(profile.createdAt),
      paidBatches: subscription?.batchesPaid ?? profile.paidBatches ?? 0,
      registrationSource: profile.registrationSource ?? (profile.ownerKey.startsWith('admin-') ? 'admin' : 'self'),
      sortTime: profile.createdAt,
    });
  }

  for (const approval of approvalsByPhone.values()) {
    if (usersByPhone.has(approval.phone)) {
      continue;
    }

    usersByPhone.set(approval.phone, {
      id: approval.approvalId,
      name: approval.name?.trim() || `Member ${approval.phone.slice(-4)}`,
      phone: approval.phone,
      status: mapApprovalToUserStatus(approval.status),
      registeredAt: formatRegisteredDate(approval.submittedAt),
      paidBatches: 0,
      registrationSource: 'self',
      sortTime: approval.submittedAt,
    });
  }

  return Array.from(usersByPhone.values())
    .sort((left, right) => right.sortTime - left.sortTime)
    .map(({ sortTime: _sortTime, ...user }) => user);
}
