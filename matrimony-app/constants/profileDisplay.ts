import { ImageSourcePropType, Platform } from 'react-native';
import { getOptionLabel } from '@/constants/formOptions';
import { Language } from '@/constants/i18n';
import { images } from '@/constants/images';
import {
  isRemotePhotoUri,
  mergeDraftProfilePhotos,
  PROFILE_PHOTOS_DRAFT_KEY,
  PROFILE_PHOTOS_KEY,
  resolveDisplayPhotoUri,
} from '@/constants/profilePhotos';

const displayPlatform = Platform.OS === 'web' ? 'web' : 'native';

export function getProfileFirstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return '';
  }

  return trimmed.split(/\s+/)[0] ?? trimmed;
}

export function getProfileAvatarUri(values: Record<string, string>): string {
  const remote = values.profilePhotoUrls?.split('|').find((photo) => isRemotePhotoUri(photo)) ?? '';
  if (remote) {
    return resolveDisplayPhotoUri(remote, displayPlatform);
  }

  const photos = mergeDraftProfilePhotos(
    values[PROFILE_PHOTOS_DRAFT_KEY] ?? '',
    values[PROFILE_PHOTOS_KEY] ?? '',
  );
  return resolveDisplayPhotoUri(photos.find((photo) => photo.length > 0) ?? '', displayPlatform);
}

export function getProfileAvatarSource(values: Record<string, string>): ImageSourcePropType {
  const uri = getProfileAvatarUri(values);
  return uri ? { uri } : images.logo;
}

export function getProfileMetaLine(values: Record<string, string>, language: Language): string {
  const locationParts = [
    values.nativeDistrict
      ? getOptionLabel('district', values.nativeDistrict, language)
      : values.nativePlace?.trim(),
    values.nativeState ? getOptionLabel('indianState', values.nativeState, language) : '',
  ].filter(Boolean);

  const community = values.caste
    ? getOptionLabel('community', values.caste, language)
    : values.subCaste
      ? getOptionLabel('subCaste', values.subCaste, language)
      : '';

  if (locationParts.length > 0 && community) {
    return `${locationParts.join(', ')} • ${community}`;
  }

  return locationParts.join(', ') || community;
}

export function getProfileCompletionPercent(values: Record<string, string>): number {
  if (values.fullName?.trim() && values.partnerPreferredLocation) {
    return 100;
  }

  const trackedKeys = [
    'profileFor',
    'fullName',
    'gender',
    'religion',
    'caste',
    'dateOfBirth',
    'maritalStatus',
    'education',
    'occupation',
    'workType',
    'monthlyIncome',
    'nativePlace',
    'nativeDistrict',
    'nativeState',
    'partnerAgeFrom',
    'partnerAgeTo',
    'partnerEducation',
    'partnerPreferredLocation',
    PROFILE_PHOTOS_KEY,
  ];

  const filledCount = trackedKeys.filter((key) => Boolean(values[key]?.trim())).length;
  return Math.min(100, Math.round((filledCount / trackedKeys.length) * 100));
}
