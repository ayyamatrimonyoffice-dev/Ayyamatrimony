import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { getDownloadURL, ref, uploadBytes, uploadString } from 'firebase/storage';
import { getFirebaseStorage } from '@/lib/firebase';
import { isRemotePhotoUri } from '@/constants/profilePhotos';

const UPLOAD_TIMEOUT_MS = 20000;
const READ_URI_TIMEOUT_MS = 15000;

let cloudPhotoUploadEnabled: boolean | null = null;

/** Firebase Storage uploads need bucket CORS rules; web/local dev saves photos locally instead. */
export function shouldAttemptCloudPhotoUpload(): boolean {
  if (Platform.OS === 'web') {
    return false;
  }
  return cloudPhotoUploadEnabled !== false;
}

export function markCloudPhotoUploadUnavailable(): void {
  cloudPhotoUploadEnabled = false;
}

export function isCloudPhotoUploadError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return true;
  }

  const firebaseError = error as { code?: string; status_?: number };
  if (firebaseError.status_ === 404) {
    markCloudPhotoUploadUnavailable();
    return true;
  }

  if (
    firebaseError.code?.startsWith('storage/') ||
    firebaseError.code === 'storage/unauthorized'
  ) {
    markCloudPhotoUploadUnavailable();
    return true;
  }

  return Boolean(firebaseError.code?.startsWith('storage/'));
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

async function normalizeLocalPhotoUri(uri: string): Promise<string> {
  if (Platform.OS === 'web' || uri.startsWith('file://')) {
    return uri;
  }

  if (uri.startsWith('content://')) {
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) {
      throw new Error('Unable to access photo cache.');
    }

    const destination = `${cacheDir}profile_upload_${Date.now()}.jpg`;
    await FileSystem.copyAsync({ from: uri, to: destination });
    return destination;
  }

  return uri;
}

function base64ToBlob(base64: string, mimeType = 'image/jpeg'): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}

async function readNativePhotoAsBlob(uri: string): Promise<Blob> {
  const localUri = await withTimeout(
    normalizeLocalPhotoUri(uri),
    READ_URI_TIMEOUT_MS,
    'Timed out while preparing the selected photo.',
  );
  const base64 = await withTimeout(
    FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    }),
    READ_URI_TIMEOUT_MS,
    'Timed out while reading the selected photo.',
  );

  if (!base64) {
    throw new Error('Selected photo is empty or unreadable.');
  }

  return base64ToBlob(base64);
}

async function uriToBlob(uri: string): Promise<Blob> {
  if (!uri.trim()) {
    return new Blob();
  }

  if (uri.startsWith('data:') || uri.startsWith('blob:') || isRemotePhotoUri(uri)) {
    const response = await withTimeout(
      fetch(uri),
      READ_URI_TIMEOUT_MS,
      'Timed out while reading the selected photo.',
    );
    if (!response.ok) {
      throw new Error('Unable to read selected photo.');
    }
    return response.blob();
  }

  if (Platform.OS !== 'web') {
    return readNativePhotoAsBlob(uri);
  }

  const response = await withTimeout(
    fetch(uri),
    READ_URI_TIMEOUT_MS,
    'Timed out while reading the selected photo.',
  );
  if (!response.ok) {
    throw new Error('Unable to read selected photo.');
  }
  return response.blob();
}

export async function uploadProfilePhoto(
  phone: string,
  slotIndex: number,
  localUri: string,
): Promise<string> {
  if (!localUri.trim()) {
    return '';
  }

  if (isRemotePhotoUri(localUri)) {
    return localUri;
  }

  if (!shouldAttemptCloudPhotoUpload()) {
    return '';
  }

  const storage = await getFirebaseStorage();
  if (!storage) {
    markCloudPhotoUploadUnavailable();
    throw new Error('Photo storage is unavailable.');
  }

  const digits = phone.replace(/\D/g, '');
  if (!digits) {
    throw new Error('Phone number is required to upload photos.');
  }

  const objectRef = ref(storage, `profiles/${digits}/photos/photo_${slotIndex}.jpg`);

  if (localUri.startsWith('data:image/')) {
    await withTimeout(
      uploadString(objectRef, localUri, 'data_url', { contentType: 'image/jpeg' }),
      UPLOAD_TIMEOUT_MS,
      'Photo upload timed out. Please try again.',
    );
    cloudPhotoUploadEnabled = true;
    return getDownloadURL(objectRef);
  }

  const blob = await uriToBlob(localUri);
  if (!blob.size) {
    throw new Error('Selected photo is empty or unreadable.');
  }

  await withTimeout(
    uploadBytes(objectRef, blob, { contentType: 'image/jpeg' }),
    UPLOAD_TIMEOUT_MS,
    'Photo upload timed out. Please try again.',
  );
  cloudPhotoUploadEnabled = true;
  return getDownloadURL(objectRef);
}

export async function uploadProfilePhotos(
  phone: string,
  localUris: string[],
): Promise<string[]> {
  if (!shouldAttemptCloudPhotoUpload()) {
    return localUris.map((uri) => (isRemotePhotoUri(uri) ? uri : ''));
  }

  try {
    return await Promise.all(localUris.map((uri, index) => uploadProfilePhoto(phone, index, uri)));
  } catch (error) {
    markCloudPhotoUploadUnavailable();
    throw error;
  }
}
