import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS, type FirestoreVendorDoc } from '@/lib/firestore/collections';

export async function listActiveVendors(registrationCommunity?: string): Promise<FirestoreVendorDoc[]> {
  const db = await getFirebaseFirestore();
  if (!db) {
    return [];
  }

  const snapshot = await getDocs(
    query(collection(db, FIRESTORE_COLLECTIONS.vendors), where('active', '==', true)),
  );

  let vendors = snapshot.docs.map((entry) => entry.data() as FirestoreVendorDoc);
  if (registrationCommunity?.trim()) {
    vendors = vendors.filter(
      (vendor) =>
        !vendor.registrationCommunity ||
        vendor.registrationCommunity === registrationCommunity.trim(),
    );
  }

  return vendors.sort((left, right) => left.name.localeCompare(right.name));
}

export async function upsertVendor(vendor: Omit<FirestoreVendorDoc, 'createdAt' | 'updatedAt'>): Promise<void> {
  const db = await getFirebaseFirestore();
  if (!db) {
    return;
  }

  const now = Date.now();
  const existing = await getDocs(
    query(collection(db, FIRESTORE_COLLECTIONS.vendors), where('vendorId', '==', vendor.vendorId)),
  );
  const createdAt = existing.docs[0]?.data()?.createdAt ?? now;

  await setDoc(
    doc(db, FIRESTORE_COLLECTIONS.vendors, vendor.vendorId),
    {
      ...vendor,
      createdAt,
      updatedAt: now,
    } satisfies FirestoreVendorDoc,
    { merge: true },
  );
}
