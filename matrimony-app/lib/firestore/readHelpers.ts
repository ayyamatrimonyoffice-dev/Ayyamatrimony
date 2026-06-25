import {
  type DocumentReference,
  type DocumentSnapshot,
  getDoc,
  getDocFromCache,
} from 'firebase/firestore';

export function isNetworkOnline(): boolean {
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return navigator.onLine;
  }
  return true;
}

export function isFirestoreTransientError(error: unknown): boolean {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code: string }).code)
      : '';
  return ['unavailable', 'deadline-exceeded', 'failed-precondition'].includes(code);
}

export async function getDocResilient(
  docRef: DocumentReference,
): Promise<DocumentSnapshot | null> {
  if (!isNetworkOnline()) {
    try {
      return await getDocFromCache(docRef);
    } catch {
      return null;
    }
  }

  try {
    return await getDoc(docRef);
  } catch (error) {
    if (!isFirestoreTransientError(error)) {
      throw error;
    }
    try {
      return await getDocFromCache(docRef);
    } catch {
      return null;
    }
  }
}
