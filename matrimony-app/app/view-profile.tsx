import { useCallback, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { BiodataExportPanel } from '@/components/BiodataExportPanel';
import { CreateProfileBiodataForm } from '@/components/CreateProfileBiodataForm';
import { getProfileAvatarUri } from '@/constants/profileDisplay';
import { colors, spacing } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useProfileForm } from '@/context/ProfileFormContext';
import { useBiodataExportPhoto } from '@/hooks/useBiodataExportPhoto';
import type { BiodataExportOptions } from '@/lib/biodataExport';

export default function ViewProfileScreen() {
  const router = useRouter();
  const { translate } = useLanguage();
  const { values } = useProfileForm();
  const exportOptionsRef = useRef<BiodataExportOptions>({ includePhoto: false, photoUri: '' });

  const profilePhotoUri = useMemo(() => getProfileAvatarUri(values), [values]);
  const {
    includePhoto,
    setIncludePhoto,
    exportPhotoUri,
    exportOptions,
    pickExportPhoto,
    clearExportPhoto,
  } = useBiodataExportPhoto({ profilePhotoUri });

  exportOptionsRef.current = exportOptions;
  const getExportOptions = useCallback(() => exportOptionsRef.current, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <AppHeader
        title={translate('viewProfile')}
        showBack
        showTamil={false}
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <BiodataExportPanel
          includePhoto={includePhoto}
          onIncludePhotoChange={setIncludePhoto}
          onPickPhoto={pickExportPhoto}
          onClearPhoto={clearExportPhoto}
          hasExportPhoto={Boolean(exportPhotoUri)}
          hasProfilePhoto={Boolean(profilePhotoUri)}
        />
        <View style={styles.formWrap}>
          <CreateProfileBiodataForm
            editable={false}
            viewOnly
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
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  formWrap: {
    flex: 1,
    minHeight: 480,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
});
