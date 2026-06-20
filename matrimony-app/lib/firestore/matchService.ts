import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS, type FirestoreMatchDoc } from '@/lib/firestore/collections';

function matchDocId(phoneA: string, phoneB: string): string {
  const sorted = [phoneA.replace(/\D/g, ''), phoneB.replace(/\D/g, '')].filter(Boolean).sort();
  return sorted.length === 2 ? `match_${sorted[0]}_${sorted[1]}` : '';
}

export async function createMutualMatch(
  profileIdA: string,
  profileIdB: string,
  phoneA: string,
  phoneB: string,
): Promise<void> {
  const db = await getFirebaseFirestore();
  const id = matchDocId(phoneA, phoneB);
  if (!db || !id) {
    return;
  }

  const payload: FirestoreMatchDoc = {
    matchId: id,
    profileIdA,
    profileIdB,
    phoneA: phoneA.replace(/\D/g, ''),
    phoneB: phoneB.replace(/\D/g, ''),
    matchedAt: Date.now(),
    status: 'active',
  };

  await setDoc(doc(db, FIRESTORE_COLLECTIONS.matches, id), payload, { merge: true });
}

export async function listMatchesForPhone(phone: string): Promise<FirestoreMatchDoc[]> {
  const db = await getFirebaseFirestore();
  const digits = phone.replace(/\D/g, '');
  if (!db || !digits) {
    return [];
  }

  const [asA, asB] = await Promise.all([
    getDocs(query(collection(db, FIRESTORE_COLLECTIONS.matches), where('phoneA', '==', digits))),
    getDocs(query(collection(db, FIRESTORE_COLLECTIONS.matches), where('phoneB', '==', digits))),
  ]);

  const merged = new Map<string, FirestoreMatchDoc>();
  [...asA.docs, ...asB.docs].forEach((entry) => {
    merged.set(entry.id, entry.data() as FirestoreMatchDoc);
  });

  return [...merged.values()];
}
