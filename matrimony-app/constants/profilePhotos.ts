export const PROFILE_PHOTOS_KEY = 'profilePhotos';
/** Local file/content URIs during biodata draft — survives Android activity restarts. */
export const PROFILE_PHOTOS_DRAFT_KEY = 'profilePhotosDraft';
export const BIODATA_SHOW_PHOTO_KEY = 'biodataShowPhoto';
export const PHOTO_SKIP_KEY = 'photoSkipped';

export function parseBiodataShowPhoto(raw: string | undefined): boolean {
  if (!raw?.trim()) {
    return true;
  }
  return raw.trim().toLowerCase() !== 'false';
}
export const MAX_PROFILE_PHOTOS = 3;

export function isRemotePhotoUri(uri: string): boolean {
  return uri.startsWith('http://') || uri.startsWith('https://');
}

export function isLocalPhotoUri(uri: string): boolean {
  return Boolean(uri.trim()) && !isRemotePhotoUri(uri);
}

/** URLs that can render in a browser (admin web, Expo web). */
export function isWebDisplayablePhotoUri(uri: string): boolean {
  const trimmed = uri.trim();
  if (!trimmed) {
    return false;
  }
  return (
    isRemotePhotoUri(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')
  );
}

/** URLs that can render on a native device (includes local cache paths). */
export function isNativeDisplayablePhotoUri(uri: string): boolean {
  const trimmed = uri.trim();
  if (!trimmed) {
    return false;
  }
  return (
    isWebDisplayablePhotoUri(trimmed) ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://')
  );
}

export function isDisplayablePhotoUri(uri: string, platform: 'web' | 'native' = 'native'): boolean {
  return platform === 'web' ? isWebDisplayablePhotoUri(uri) : isNativeDisplayablePhotoUri(uri);
}

/** Drop device-local paths on web so Image does not throw "Not allowed to load local resource". */
export function resolveDisplayPhotoUri(uri: string, platform: 'web' | 'native' = 'native'): string {
  const trimmed = uri?.trim() ?? '';
  return isDisplayablePhotoUri(trimmed, platform) ? trimmed : '';
}

export function firstDisplayablePhotoUri(
  photos: string[],
  platform: 'web' | 'native' = 'native',
): string {
  for (const photo of photos) {
    const resolved = resolveDisplayPhotoUri(photo, platform);
    if (resolved) {
      return resolved;
    }
  }
  return '';
}

/** Listing cards and Firestore should only store cloud URLs — never device cache paths. */
export function resolvePortableListingPhotoUri(photos: string[]): string {
  return photos.find(isRemotePhotoUri) ?? '';
}

/** Keep only cloud URLs in persisted profile storage — never base64/blob/file paths. */
export function photosForPersistence(photos: string[]): string[] {
  return Array.from({ length: MAX_PROFILE_PHOTOS }, (_, index) => {
    const photo = photos[index] ?? '';
    return isRemotePhotoUri(photo) ? photo : '';
  });
}

export function serializePersistedProfilePhotos(photos: string[]): string {
  return serializeProfilePhotos(photosForPersistence(photos));
}

/** Prefer in-progress local draft URIs over persisted remote-only slots. */
export function mergeDraftProfilePhotos(draftRaw: string, persistedRaw: string): string[] {
  const draftPhotos = parseProfilePhotos(draftRaw);
  const storedPhotos = parseProfilePhotos(persistedRaw);
  if (draftPhotos.some((photo) => photo.length > 0)) {
    return draftPhotos;
  }
  return storedPhotos;
}

export function parseProfilePhotos(raw: string): string[] {
  if (!raw) {
    return Array.from({ length: MAX_PROFILE_PHOTOS }, () => '');
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return Array.from({ length: MAX_PROFILE_PHOTOS }, (_, index) => {
        const item = parsed[index];
        return typeof item === 'string' ? item : '';
      });
    }
  } catch {
    // Ignore invalid stored values.
  }

  return Array.from({ length: MAX_PROFILE_PHOTOS }, () => '');
}

export function serializeProfilePhotos(photos: string[]): string {
  return JSON.stringify(
    Array.from({ length: MAX_PROFILE_PHOTOS }, (_, index) => photos[index] ?? ''),
  );
}

export function mergeUploadedPhotos(localPhotos: string[], uploadedPhotos: string[]): string[] {
  return Array.from({ length: MAX_PROFILE_PHOTOS }, (_, index) => {
    const uploaded = uploadedPhotos[index] ?? '';
    const local = localPhotos[index] ?? '';
    if (uploaded) {
      return uploaded;
    }
    if (isRemotePhotoUri(local)) {
      return local;
    }
    return local;
  });
}

export function remotePhotoUrlList(photos: string[]): string[] {
  return photos.filter((photo) => isRemotePhotoUri(photo));
}

export function serializeRemotePhotoUrls(photos: string[]): string {
  return remotePhotoUrlList(photos).join('|');
}

/** Merge every Firestore photo field into fixed slots for admin display and biodata hydration. */
export function resolveProfilePhotoSlots(
  profile: {
    photoUrls?: string[];
    approvedPhotoUrls?: string[];
    primaryPhotoUrl?: string;
    listing?: { image?: string };
    biodata?: Record<string, string>;
  },
  fallbackSlots: string[] = [],
): string[] {
  const biodata = profile.biodata ?? {};
  const fromDoc = Array.isArray(profile.photoUrls) ? profile.photoUrls : [];
  const fromApproved = Array.isArray(profile.approvedPhotoUrls) ? profile.approvedPhotoUrls : [];
  const fromBiodataPhotos = parseProfilePhotos(biodata[PROFILE_PHOTOS_KEY] ?? '');
  const fromPipe = (biodata.profilePhotoUrls ?? '').split('|');
  const primary = profile.primaryPhotoUrl?.trim() ?? '';
  const listingImage = profile.listing?.image?.trim() ?? '';

  return Array.from({ length: MAX_PROFILE_PHOTOS }, (_, index) => {
    const candidates = [
      fromDoc[index],
      fromApproved[index],
      fromBiodataPhotos[index],
      fromPipe[index],
      fallbackSlots[index],
      index === 0 ? primary : '',
      index === 0 ? listingImage : '',
    ];

    for (const candidate of candidates) {
      if (candidate && isRemotePhotoUri(candidate)) {
        return candidate;
      }
    }

    return '';
  });
}

export function mergeProfilePhotosIntoBiodata(
  biodata: Record<string, string>,
  profile: {
    photoUrls?: string[];
    approvedPhotoUrls?: string[];
    primaryPhotoUrl?: string;
    listing?: { image?: string };
    biodata?: Record<string, string>;
  },
  fallbackSlots: string[] = [],
): Record<string, string> {
  const slots = resolveProfilePhotoSlots(profile, fallbackSlots);
  if (!slots.some(Boolean)) {
    return biodata;
  }

  const primary = slots.find(Boolean) ?? '';
  return {
    ...biodata,
    profilePhotoUrls: serializeRemotePhotoUrls(slots),
    [PROFILE_PHOTOS_KEY]: serializeProfilePhotos(slots),
    listingImage: primary,
  };
}

/** Admin lists and profile view — only cloud URLs (not device-local paths). */
export function getAdminProfilePhotoUri(
  profile: {
    photoUrls?: string[];
    approvedPhotoUrls?: string[];
    primaryPhotoUrl?: string;
    listing?: { image?: string };
    biodata?: Record<string, string>;
  },
  platform: 'web' | 'native' = 'native',
  fallbackSlots: string[] = [],
): string {
  const slots = resolveProfilePhotoSlots(profile, fallbackSlots);
  const resolved = firstDisplayablePhotoUri(slots, platform);
  if (resolved) {
    return resolved;
  }

  const listingImage = profile.listing?.image?.trim() ?? '';
  if (isRemotePhotoUri(listingImage)) {
    return resolveDisplayPhotoUri(listingImage, platform);
  }

  const biodataPrimary = profile.biodata?.listingImage?.trim() ?? '';
  if (isRemotePhotoUri(biodataPrimary)) {
    return resolveDisplayPhotoUri(biodataPrimary, platform);
  }

  return '';
}

export function biodataForFirestore(values: Record<string, string>): Record<string, string> {
  const remoteUrls = values.profilePhotoUrls?.split('|').filter(isRemotePhotoUri) ?? [];
  const localPhotos = parseProfilePhotos(values[PROFILE_PHOTOS_KEY] ?? '');
  const remoteSlots = Array.from({ length: MAX_PROFILE_PHOTOS }, (_, index) => {
    const remote = remoteUrls[index] ?? '';
    const local = localPhotos[index] ?? '';
    return isRemotePhotoUri(remote) ? remote : isRemotePhotoUri(local) ? local : '';
  });

  return {
    ...values,
    profilePhotoUrls: serializeRemotePhotoUrls(remoteSlots),
    [PROFILE_PHOTOS_KEY]: serializeProfilePhotos(remoteSlots),
  };
}

export function hasRequiredPhotos(photos: string[], skipped: boolean): boolean {
  return skipped || photos.some((photo) => photo.length > 0);
}
