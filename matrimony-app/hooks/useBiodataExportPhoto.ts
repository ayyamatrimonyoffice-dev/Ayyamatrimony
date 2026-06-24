import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import type { BiodataExportOptions } from '@/lib/biodataExport';

async function normalizePickedPhotoUri(uri: string): Promise<string> {
  if (Platform.OS === 'web' || !uri.trim()) {
    return uri;
  }

  if (uri.startsWith('file://')) {
    return uri;
  }

  if (!uri.startsWith('content://')) {
    return uri;
  }

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    return uri;
  }

  const destination = `${cacheDir}export_pick_${Date.now()}.jpg`;
  try {
    await FileSystem.copyAsync({ from: uri, to: destination });
    return destination;
  } catch {
    return uri;
  }
}

type UseBiodataExportPhotoOptions = {
  profilePhotoUri?: string;
  /** When a profile photo exists, whether biodata preview/export should show it. */
  includePhotoPreference?: boolean;
  /** Called after the user picks a new export photo — use to persist to profile storage. */
  onPhotoPicked?: (uri: string) => void | Promise<void>;
};

export function useBiodataExportPhoto({
  profilePhotoUri = '',
  includePhotoPreference = true,
  onPhotoPicked,
}: UseBiodataExportPhotoOptions) {
  const [includePhoto, setIncludePhoto] = useState(
    () => Boolean(profilePhotoUri.trim()) && includePhotoPreference,
  );
  const [exportPhotoUri, setExportPhotoUri] = useState('');

  useEffect(() => {
    if (profilePhotoUri.trim() && !exportPhotoUri.trim()) {
      setIncludePhoto(includePhotoPreference);
    }
  }, [exportPhotoUri, includePhotoPreference, profilePhotoUri]);

  const effectivePhotoUri = useMemo(() => {
    if (!includePhoto) {
      return '';
    }
    return exportPhotoUri.trim() || profilePhotoUri.trim();
  }, [exportPhotoUri, includePhoto, profilePhotoUri]);

  const exportOptions = useMemo<BiodataExportOptions>(
    () => ({
      includePhoto,
      photoUri: effectivePhotoUri,
    }),
    [effectivePhotoUri, includePhoto],
  );

  const pickExportPhoto = useCallback(async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        Alert.alert('Permission required', 'Allow photo library access to add a photo for export.');
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: Platform.OS !== 'web',
        aspect: [3, 4],
        quality: 0.85,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]?.uri) {
        return;
      }

      const uri = await normalizePickedPhotoUri(result.assets[0].uri);
      setExportPhotoUri(uri);
      setIncludePhoto(true);
      await onPhotoPicked?.(uri);
    } catch {
      Alert.alert('Photo unavailable', 'Could not pick a photo from this device.');
    }
  }, [onPhotoPicked]);

  const clearExportPhoto = useCallback(() => {
    setExportPhotoUri('');
  }, []);

  return {
    includePhoto,
    setIncludePhoto,
    exportPhotoUri,
    effectivePhotoUri,
    exportOptions,
    pickExportPhoto,
    clearExportPhoto,
  };
}
