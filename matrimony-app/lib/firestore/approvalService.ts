import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { createAdminNotification } from '@/lib/firestore/adminNotificationService';
import type { AdminApprovalRecord } from '@/constants/adminMockData';
import { isAdminPhone } from '@/constants/admin';
import { getFirebaseFirestore } from '@/lib/firebase';
import {
  approvalDocIdFromPhone,
  FIRESTORE_COLLECTIONS,
  profileDocIdFromPhone,
  type FirestoreApprovalDoc,
} from '@/lib/firestore/collections';

function formatApprovalDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function toAdminApprovalRecord(entry: FirestoreApprovalDoc): AdminApprovalRecord {
  return {
    id: entry.approvalId,
    name: entry.name,
    phone: entry.phone,
    submittedAt: formatApprovalDate(entry.submittedAt),
    status: entry.status,
  };
}

export async function submitLoginApproval(
  phone: string,
  options: {
    name?: string;
    profileId?: string;
    registrationCommunity?: string;
    source?: FirestoreApprovalDoc['source'];
  } = {},
): Promise<void> {
  const digits = phone.replace(/\D/g, '');
  if (!digits || isAdminPhone(digits)) {
    return;
  }

  const db = await getFirebaseFirestore();
  if (!db) {
    return;
  }

  const approvalId = approvalDocIdFromPhone(digits);
  const docRef = doc(db, FIRESTORE_COLLECTIONS.approvals, approvalId);
  const existing = await getDoc(docRef);
  const existingData = existing.exists() ? (existing.data() as FirestoreApprovalDoc) : null;

  if (existingData?.status === 'approved') {
    return;
  }

  const now = Date.now();
  const nextName =
    options.name?.trim() ||
    existingData?.name ||
    `Member ${digits.slice(-4)}`;

  const payload: FirestoreApprovalDoc = {
    approvalId,
    phone: digits,
    name: nextName,
    profileId: options.profileId ?? existingData?.profileId,
    registrationCommunity:
      options.registrationCommunity ?? existingData?.registrationCommunity,
    status: 'pending',
    submittedAt: existingData?.status === 'pending' ? existingData.submittedAt : now,
    updatedAt: now,
    source: options.source ?? existingData?.source ?? 'login',
  };

  await setDoc(docRef, payload, { merge: true });

  const profileId = profileDocIdFromPhone(digits);
  if (profileId) {
    await setDoc(
      doc(db, FIRESTORE_COLLECTIONS.profiles, profileId),
      { approvalStatus: 'pending', updatedAt: now },
      { merge: true },
    );
  }

  void createAdminNotification({
    title: 'New profile approval',
    body: `${nextName} submitted a profile for review.`,
    type: 'profile',
    relatedPhone: digits,
  }).catch(() => undefined);
}

export async function fetchUserApprovalStatus(
  phone: string,
): Promise<FirestoreApprovalDoc['status'] | null> {
  const digits = phone.replace(/\D/g, '');
  if (!digits || isAdminPhone(digits)) {
    return 'approved';
  }

  const db = await getFirebaseFirestore();
  if (!db) {
    return null;
  }

  const approvalId = approvalDocIdFromPhone(digits);
  const approvalSnapshot = await getDoc(doc(db, FIRESTORE_COLLECTIONS.approvals, approvalId));
  if (approvalSnapshot.exists()) {
    return (approvalSnapshot.data() as FirestoreApprovalDoc).status;
  }

  const profileId = profileDocIdFromPhone(digits);
  if (profileId) {
    const profileSnapshot = await getDoc(doc(db, FIRESTORE_COLLECTIONS.profiles, profileId));
    if (profileSnapshot.exists()) {
      const profile = profileSnapshot.data() as { approvalStatus?: FirestoreApprovalDoc['status'] };
      return profile.approvalStatus ?? null;
    }
  }

  return null;
}

export function resolveUserApprovalStatus(
  ...statuses: Array<FirestoreApprovalDoc['status'] | null | undefined | string>
): FirestoreApprovalDoc['status'] | null {
  const normalized = statuses.filter(
    (status): status is FirestoreApprovalDoc['status'] =>
      status === 'approved' || status === 'pending' || status === 'rejected',
  );

  if (normalized.includes('approved')) {
    return 'approved';
  }
  if (normalized.includes('rejected')) {
    return 'rejected';
  }
  if (normalized.includes('pending')) {
    return 'pending';
  }

  return null;
}

export function canUserBrowseProfiles(status: FirestoreApprovalDoc['status'] | null): boolean {
  return status === 'approved';
}

export async function listApprovals(): Promise<AdminApprovalRecord[]> {
  const db = await getFirebaseFirestore();
  if (!db) {
    return [];
  }

  try {
    const snapshot = await getDocs(
      query(collection(db, FIRESTORE_COLLECTIONS.approvals), orderBy('updatedAt', 'desc')),
    );
    return snapshot.docs.map((entry) =>
      toAdminApprovalRecord(entry.data() as FirestoreApprovalDoc),
    );
  } catch {
    const snapshot = await getDocs(collection(db, FIRESTORE_COLLECTIONS.approvals));
    return snapshot.docs
      .map((entry) => entry.data() as FirestoreApprovalDoc)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map(toAdminApprovalRecord);
  }
}

export async function updateApprovalStatus(
  approvalId: string,
  status: AdminApprovalRecord['status'],
): Promise<void> {
  const db = await getFirebaseFirestore();
  if (!db) {
    return;
  }

  const docRef = doc(db, FIRESTORE_COLLECTIONS.approvals, approvalId);
  const existing = await getDoc(docRef);
  if (!existing.exists()) {
    return;
  }

  const current = existing.data() as FirestoreApprovalDoc;
  await setDoc(
    docRef,
    {
      ...current,
      status,
      updatedAt: Date.now(),
    } satisfies FirestoreApprovalDoc,
    { merge: true },
  );

  const profileId = profileDocIdFromPhone(current.phone);
  if (profileId) {
    await setDoc(
      doc(db, FIRESTORE_COLLECTIONS.profiles, profileId),
      {
        approvalStatus: status,
        updatedAt: Date.now(),
      },
      { merge: true },
    );
  }
}
