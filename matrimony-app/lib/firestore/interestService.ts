import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import type { SentInterest } from '@/context/MatchActionsContext';
import { getFirebaseFirestore } from '@/lib/firebase';
import {
  FIRESTORE_COLLECTIONS,
  type FirestoreInterestDoc,
  interestDocId,
} from '@/lib/firestore/collections';

function interestToDoc(fromPhone: string, fromProfileId: string, interest: SentInterest): FirestoreInterestDoc {
  return {
    interestId: interestDocId(fromPhone, interest.memberId),
    fromPhone: fromPhone.replace(/\D/g, ''),
    fromProfileId,
    toProfileId: interest.memberId,
    status: interest.status,
    memberName: interest.memberName,
    memberImage: interest.memberImage,
    age: interest.age,
    community: interest.community,
    location: interest.location,
    sentAt: Date.now(),
  };
}

function docToSentInterest(entry: FirestoreInterestDoc): SentInterest {
  return {
    memberId: entry.toProfileId,
    memberName: entry.memberName,
    memberImage: entry.memberImage,
    age: entry.age,
    community: entry.community,
    location: entry.location,
    sentAt: new Date(entry.sentAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    }),
    status: entry.status,
  };
}

export async function saveSentInterest(
  fromPhone: string,
  fromProfileId: string,
  interest: SentInterest,
): Promise<void> {
  const db = await getFirebaseFirestore();
  if (!db) {
    return;
  }

  const payload = interestToDoc(fromPhone, fromProfileId, interest);
  await setDoc(doc(db, FIRESTORE_COLLECTIONS.interests, payload.interestId), payload, { merge: true });
}

export async function listSentInterests(fromPhone: string): Promise<SentInterest[]> {
  const db = await getFirebaseFirestore();
  const digits = fromPhone.replace(/\D/g, '');
  if (!db || !digits) {
    return [];
  }

  const snapshot = await getDocs(
    query(collection(db, FIRESTORE_COLLECTIONS.interests), where('fromPhone', '==', digits)),
  );

  return snapshot.docs.map((entry) => docToSentInterest(entry.data() as FirestoreInterestDoc));
}

export async function listReceivedInterests(toProfileId: string): Promise<FirestoreInterestDoc[]> {
  const db = await getFirebaseFirestore();
  if (!db || !toProfileId) {
    return [];
  }

  const snapshot = await getDocs(
    query(collection(db, FIRESTORE_COLLECTIONS.interests), where('toProfileId', '==', toProfileId)),
  );

  return snapshot.docs.map((entry) => entry.data() as FirestoreInterestDoc);
}
