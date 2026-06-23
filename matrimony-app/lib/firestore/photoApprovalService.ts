import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import {
  FIRESTORE_COLLECTIONS,
  photoApprovalDocId,
  profileDocIdFromPhone,
  type FirestorePhotoApprovalDoc,
  type FirestoreProfileDoc,
} from '@/lib/firestore/collections';
import { createAdminNotification } from '@/lib/firestore/adminNotificationService';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export type AdminPhotoApprovalRecord = {
  id: string;
  phone: string;
  memberName: string;
  photoUrl: string;
  slot: number;
  status: FirestorePhotoApprovalDoc['status'];
  submittedAt: string;
};

function toAdminPhotoRecord(entry: FirestorePhotoApprovalDoc): AdminPhotoApprovalRecord {
  return {
    id: entry.photoApprovalId,
    phone: entry.phone,
    memberName: entry.memberName,
    photoUrl: entry.photoUrl,
    slot: entry.slot,
    status: entry.status,
    submittedAt: formatDate(entry.submittedAt),
  };
}

export async function submitPhotoForApproval(
  phone: string,
  options: {
    memberName?: string;
    photoUrl: string;
    slot: number;
    autoApprove?: boolean;
  },
): Promise<void> {
  const digits = phone.replace(/\D/g, '');
  if (!digits || !options.photoUrl.trim()) {
    return;
  }

  const db = await getFirebaseFirestore();
  if (!db) {
    return;
  }

  const photoApprovalId = photoApprovalDocId(digits, options.slot);
  const profileId = profileDocIdFromPhone(digits);
  const now = Date.now();
  const status = options.autoApprove ? 'approved' : 'pending';

  const payload: FirestorePhotoApprovalDoc = {
    photoApprovalId,
    phone: digits,
    memberName: options.memberName?.trim() || `Member ${digits.slice(-4)}`,
    profileId: profileId || '',
    photoUrl: options.photoUrl.trim(),
    slot: options.slot,
    status,
    submittedAt: now,
    updatedAt: now,
    reviewedBy: options.autoApprove ? 'admin' : undefined,
  };

  await setDoc(doc(db, FIRESTORE_COLLECTIONS.photoApprovals, photoApprovalId), payload, {
    merge: true,
  });

  if (profileId) {
    const profileRef = doc(db, FIRESTORE_COLLECTIONS.profiles, profileId);
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      const profile = profileSnap.data() as FirestoreProfileDoc;
      const photoUrls = [...(profile.photoUrls ?? [])];
      photoUrls[options.slot] = options.photoUrl.trim();
      const approvedPhotoUrls = [...(profile.approvedPhotoUrls ?? [])];
      if (status === 'approved') {
        approvedPhotoUrls[options.slot] = options.photoUrl.trim();
      } else {
        approvedPhotoUrls[options.slot] = '';
      }

      await setDoc(
        profileRef,
        {
          photoUrls,
          approvedPhotoUrls,
          primaryPhotoUrl:
            approvedPhotoUrls.find(Boolean) ||
            photoUrls.find(Boolean) ||
            profile.primaryPhotoUrl ||
            '',
          updatedAt: now,
        },
        { merge: true },
      );
    }
  }

  if (!options.autoApprove) {
    void createAdminNotification({
      title: 'Photo pending review',
      body: `${payload.memberName} uploaded a photo for moderation.`,
      type: 'photo',
      relatedPhone: digits,
    }).catch(() => undefined);
  }
}

export async function listPhotoApprovals(
  status?: FirestorePhotoApprovalDoc['status'],
): Promise<AdminPhotoApprovalRecord[]> {
  const db = await getFirebaseFirestore();
  if (!db) {
    return [];
  }

  const snapshot = await getDocs(
    query(collection(db, FIRESTORE_COLLECTIONS.photoApprovals), orderBy('updatedAt', 'desc')),
  );

  return snapshot.docs
    .map((entry) => toAdminPhotoRecord(entry.data() as FirestorePhotoApprovalDoc))
    .filter((entry) => (status ? entry.status === status : true));
}

export async function updatePhotoApprovalStatus(
  photoApprovalId: string,
  status: 'approved' | 'rejected',
  options: { reviewedBy?: string; rejectReason?: string } = {},
): Promise<void> {
  const db = await getFirebaseFirestore();
  if (!db) {
    return;
  }

  const docRef = doc(db, FIRESTORE_COLLECTIONS.photoApprovals, photoApprovalId);
  const existing = await getDoc(docRef);
  if (!existing.exists()) {
    return;
  }

  const current = existing.data() as FirestorePhotoApprovalDoc;
  const now = Date.now();

  await setDoc(
    docRef,
    {
      ...current,
      status,
      updatedAt: now,
      reviewedBy: options.reviewedBy ?? 'admin',
      rejectReason: status === 'rejected' ? options.rejectReason : undefined,
    } satisfies FirestorePhotoApprovalDoc,
    { merge: true },
  );

  if (current.profileId) {
    const profileRef = doc(db, FIRESTORE_COLLECTIONS.profiles, current.profileId);
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      const profile = profileSnap.data() as FirestoreProfileDoc;
      const approvedPhotoUrls = [...(profile.approvedPhotoUrls ?? profile.photoUrls ?? [])];
      if (status === 'approved') {
        approvedPhotoUrls[current.slot] = current.photoUrl;
      } else {
        approvedPhotoUrls[current.slot] = '';
        const photoUrls = [...(profile.photoUrls ?? [])];
        photoUrls[current.slot] = '';
        await setDoc(profileRef, { photoUrls, updatedAt: now }, { merge: true });
      }

      await setDoc(
        profileRef,
        {
          approvedPhotoUrls,
          primaryPhotoUrl: approvedPhotoUrls.find(Boolean) || profile.primaryPhotoUrl || '',
          updatedAt: now,
        },
        { merge: true },
      );
    }
  }
}

export async function countPendingPhotos(): Promise<number> {
  const entries = await listPhotoApprovals('pending');
  return entries.length;
}

export function isPhotoApprovedForProfile(
  profile: FirestoreProfileDoc | Record<string, string>,
  photoUrl: string,
): boolean {
  if (!photoUrl.trim()) {
    return false;
  }

  const approved = 'approvedPhotoUrls' in profile ? profile.approvedPhotoUrls : undefined;
  if (Array.isArray(approved) && approved.includes(photoUrl)) {
    return true;
  }

  if ('photoUrls' in profile && !('approvedPhotoUrls' in profile)) {
    return Boolean(photoUrl.trim());
  }

  return false;
}
