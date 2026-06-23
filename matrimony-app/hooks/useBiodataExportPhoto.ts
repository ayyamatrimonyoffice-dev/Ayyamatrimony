import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { BiodataExportOptions } from '@/lib/biodataExport';

type UseBiodataExportPhotoOptions = {
  profilePhotoUri?: string;
};

export function useBiodataExportPhoto({ profilePhotoUri = '' }: UseBiodataExportPhotoOptions) {
  const [includePhoto, setIncludePhoto] = useState(Boolean(profilePhotoUri.trim()));
  const [exportPhotoUri, setExportPhotoUri] = useState('');

  useEffect(() => {
    if (profilePhotoUri.trim() && !exportPhotoUri.trim()) {
      setIncludePhoto(true);
    }
  }, [exportPhotoUri, profilePhotoUri]);

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
      });

      if (result.canceled || !result.assets[0]?.uri) {
        return;
      }

      setExportPhotoUri(result.assets[0].uri);
      setIncludePhoto(true);
    } catch {
      Alert.alert('Photo unavailable', 'Could not pick a photo from this device.');
    }
  }, []);

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
