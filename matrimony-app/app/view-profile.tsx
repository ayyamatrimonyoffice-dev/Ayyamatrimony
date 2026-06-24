import { useCallback, useMemo, useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { BiodataExportPanel } from '@/components/BiodataExportPanel';
import { CreateProfileBiodataForm } from '@/components/CreateProfileBiodataForm';
import { getProfileAvatarUri } from '@/constants/profileDisplay';
import {
  BIODATA_SHOW_PHOTO_KEY,
  parseBiodataShowPhoto,
  parseProfilePhotos,
  PROFILE_PHOTOS_KEY,
  serializeProfilePhotos,
} from '@/constants/profilePhotos';
import { colors, spacing } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useProfileForm } from '@/context/ProfileFormContext';
import { useBiodataExportPhoto } from '@/hooks/useBiodataExportPhoto';
import type { BiodataExportOptions } from '@/lib/biodataExport';

export default function ViewProfileScreen() {
  const router = useRouter();
  const { translate } = useLanguage();
  const { values, isReady, setValue, syncProfileToFirestore } = useProfileForm();
  const exportOptionsRef = useRef<BiodataExportOptions>({ includePhoto: false, photoUri: '' });

  const profilePhotoUri = useMemo(() => getProfileAvatarUri(values), [values]);
  const includePhotoPreference = useMemo(() => {
    if (!profilePhotoUri.trim()) {
      return false;
    }
    return parseBiodataShowPhoto(values[BIODATA_SHOW_PHOTO_KEY]);
  }, [profilePhotoUri, values]);

  const handlePhotoPicked = useCallback(
    (uri: string) => {
      const nextPhotos = parseProfilePhotos('');
      nextPhotos[0] = uri;
      setValue(PROFILE_PHOTOS_KEY, serializeProfilePhotos(nextPhotos));
      setValue(BIODATA_SHOW_PHOTO_KEY, 'true');
      void syncProfileToFirestore().catch(() => undefined);
    },
    [setValue, syncProfileToFirestore],
  );

  const {
    includePhoto,
    setIncludePhoto,
    exportPhotoUri,
    exportOptions,
    pickExportPhoto,
  } = useBiodataExportPhoto({
    profilePhotoUri,
    includePhotoPreference,
    onPhotoPicked: handlePhotoPicked,
  });

  const handleIncludePhotoChange = useCallback(
    (next: boolean) => {
      setIncludePhoto(next);
      setValue(BIODATA_SHOW_PHOTO_KEY, next ? 'true' : 'false');
    },
    [setIncludePhoto, setValue],
  );

  exportOptionsRef.current = exportOptions;
  const getExportOptions = useCallback(() => exportOptionsRef.current, []);

  if (!isReady) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <AppHeader
          title={translate('viewProfile')}
          showBack
          showTamil={false}
          onBack={() => router.back()}
        />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <AppHeader
        title={translate('viewProfile')}
        showBack
        showTamil={false}
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <BiodataExportPanel
          includePhoto={includePhoto}
          onIncludePhotoChange={handleIncludePhotoChange}
          onPickPhoto={pickExportPhoto}
          hasExportPhoto={Boolean(exportPhotoUri)}
          hasProfilePhoto={Boolean(profilePhotoUri)}
        />
        <View style={styles.formWrap}>
          <CreateProfileBiodataForm
            editable={false}
            viewOnly
            profileValues={values}
            exportPhotoOptions={exportOptions}
            getExportOptions={getExportOptions}
            onSave={() => undefined}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F7FC',
  },
  scroll: {
    paddingHorizontal: spacing.containerMargin,
    paddingTop: 56,
    paddingBottom: spacing.xl + 80,
    gap: spacing.md,
  },
  formWrap: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: colors.surface,
    overflow: 'visible',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
