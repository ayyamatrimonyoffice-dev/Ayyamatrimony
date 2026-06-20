import { Platform } from 'react-native';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { getFirebaseStorage } from '@/lib/firebase';
import { isRemotePhotoUri } from '@/constants/profilePhotos';

async function uriToBlob(uri: string): Promise<Blob> {
  if (!uri.trim()) {
    return new Blob();
  }

  if (uri.startsWith('data:') || uri.startsWith('http://') || uri.startsWith('https://')) {
    const response = await fetch(uri);
    return response.blob();
  }

  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    return response.blob();
  }

  const response = await fetch(uri);
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

  const storage = await getFirebaseStorage();
  if (!storage) {
    return localUri;
  }

  const digits = phone.replace(/\D/g, '');
  const objectRef = ref(storage, `profiles/${digits}/photos/photo_${slotIndex}.jpg`);
  const blob = await uriToBlob(localUri);
  if (!blob.size) {
    return localUri;
  }

  await uploadBytes(objectRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(objectRef);
}

export async function uploadProfilePhotos(
  phone: string,
  localUris: string[],
): Promise<string[]> {
  return Promise.all(localUris.map((uri, index) => uploadProfilePhoto(phone, index, uri)));
}
