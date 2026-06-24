import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CreateProfileBiodataForm } from '@/components/CreateProfileBiodataForm';
import { BiodataExportPanel } from '@/components/BiodataExportPanel';
import { adminColors } from '@/constants/admin';
import { getOptionLabel } from '@/constants/formOptions';
import { getProfileAvatarUri } from '@/constants/profileDisplay';
import { getAdminProfilePhotoUri, parseProfilePhotos, PROFILE_PHOTOS_KEY, resolveDisplayPhotoUri } from '@/constants/profilePhotos';
import { images } from '@/constants/images';
import { useLanguage } from '@/context/LanguageContext';
import { useBiodataExportPhoto } from '@/hooks/useBiodataExportPhoto';
import type { BiodataExportOptions } from '@/lib/biodataExport';
import type { FirestoreProfileDoc } from '@/lib/firestore/collections';

type AdminMatrimonyProfileViewProps = {
  profileValues: Record<string, string>;
  profileDoc?: FirestoreProfileDoc | null;
  phone: string;
  community?: string;
  browseHidden?: boolean;
  onBrowseHiddenChange?: (hidden: boolean) => void;
  onBack: () => void;
  onEdit: () => void;
  showExportPanel?: boolean;
};

export function AdminMatrimonyProfileView({
  profileValues,
  profileDoc = null,
  phone,
  community,
  browseHidden = false,
  onBrowseHiddenChange,
  onBack,
  onEdit,
  showExportPanel = true,
}: AdminMatrimonyProfileViewProps) {
  const { language, translate } = useLanguage();
  const [hiddenFromBrowse, setHiddenFromBrowse] = useState(browseHidden);

  useEffect(() => {
    setHiddenFromBrowse(browseHidden);
  }, [browseHidden]);
  const exportOptionsRef = useRef<BiodataExportOptions>({ includePhoto: false, photoUri: '' });
  const profilePhotoUri = useMemo(() => {
    if (profileDoc) {
      const fromDoc = getAdminProfilePhotoUri(
        profileDoc,
        Platform.OS === 'web' ? 'web' : 'native',
      );
      if (fromDoc) {
        return fromDoc;
      }
    }

    const avatar = getProfileAvatarUri(profileValues);
    if (avatar) {
      return avatar;
    }

    return getAdminProfilePhotoUri(
      {
        biodata: profileValues,
        listing: { image: profileValues.listingImage },
        primaryPhotoUrl: profileValues.profilePhotoUrls?.split('|').find(Boolean),
        photoUrls: profileValues.profilePhotoUrls?.split('|').filter(Boolean),
      },
      Platform.OS === 'web' ? 'web' : 'native',
    );
  }, [profileDoc, profileValues]);
  const displayPhoto = resolveDisplayPhotoUri(
    profilePhotoUri || profileValues.listingImage || '',
    Platform.OS === 'web' ? 'web' : 'native',
  );

  const {
    includePhoto,
    setIncludePhoto,
    exportPhotoUri,
    exportOptions,
    pickExportPhoto,
  } = useBiodataExportPhoto({ profilePhotoUri });

  exportOptionsRef.current = exportOptions;
  const getExportOptions = useCallback(() => exportOptionsRef.current, []);

  const name = profileValues.fullName?.trim() || translate('adminMember');
  const rawCommunity =
    community ||
    profileValues.registrationCommunity?.trim() ||
    profileValues.caste?.trim() ||
    '';
  const communityLabel =
    rawCommunity === 'hindu'
      ? translate('hindu')
      : rawCommunity === 'christian'
        ? translate('christian')
        : rawCommunity || '—';
  const genderLabel = profileValues.gender
    ? getOptionLabel('gender', profileValues.gender, language, profileValues.gender)
    : '';

  const handleBrowseHiddenToggle = (value: boolean) => {
    setHiddenFromBrowse(value);
    onBrowseHiddenChange?.(value);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={22} color={adminColors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {name}
        </Text>
        <Pressable onPress={onEdit} hitSlop={8} style={styles.editBtn}>
          <MaterialIcons name="edit" size={18} color="#fff" />
          <Text style={styles.editBtnText}>{translate('adminEdit')}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View style={styles.photoSection}>
          <View style={styles.imageWrap}>
            {displayPhoto ? (
              <Image source={{ uri: displayPhoto }} style={styles.image} resizeMode="cover" />
            ) : (
              <Image source={images.logo} style={styles.imagePlaceholder} resizeMode="contain" />
            )}
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            <MaterialIcons name="verified" size={20} color={adminColors.success} />
          </View>
          <View style={styles.phoneRow}>
            <MaterialIcons name="phone" size={16} color={adminColors.primary} />
            <Text style={styles.phone}>+91 {phone}</Text>
          </View>
          <Text style={styles.meta}>
            {communityLabel}
            {genderLabel ? ` · ${genderLabel}` : ''}
          </Text>
        </View>

        {onBrowseHiddenChange ? (
          <View style={styles.visibilityCard}>
            <View style={styles.visibilityRow}>
              <Text style={styles.visibilityLabel}>{translate('adminBrowseHiddenLabel')}</Text>
              <Switch
                value={hiddenFromBrowse}
                onValueChange={handleBrowseHiddenToggle}
                trackColor={{ true: adminColors.primary, false: adminColors.border }}
                thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
              />
            </View>
            <Text style={styles.visibilityHint}>
              {hiddenFromBrowse
                ? translate('adminBrowseHiddenOn')
                : translate('adminBrowseHiddenOff')}
              {' · '}
              {translate('adminBrowseHiddenHint')}
            </Text>
          </View>
        ) : null}

        {showExportPanel ? (
          <View style={styles.exportWrap}>
            <BiodataExportPanel
            variant="admin"
            includePhoto={includePhoto}
            onIncludePhotoChange={setIncludePhoto}
            onPickPhoto={pickExportPhoto}
            hasExportPhoto={Boolean(exportPhotoUri)}
            hasProfilePhoto={Boolean(profilePhotoUri)}
          />
          </View>
        ) : null}

        <View style={styles.formWrap}>
          <CreateProfileBiodataForm
            key={`admin-view-${phone}-${profileValues._profileUpdatedAt ?? profileValues.registrationNumber ?? '0'}`}
            editable={false}
            viewOnly
            profileValues={profileValues}
            exportPhotoOptions={exportOptions}
            getExportOptions={getExportOptions}
            onSave={() => undefined}
          />
        </View>
      </ScrollView>
    </View>
  );
}

export function AdminMatrimonyProfileLoader() {
  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={adminColors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: adminColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: adminColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: adminColors.border,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: adminColors.text,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: adminColors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  editBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    paddingBottom: 48,
    gap: 12,
  },
  photoSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
    backgroundColor: adminColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: adminColors.border,
  },
  imageWrap: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 0.82,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: adminColors.primaryLight,
    borderWidth: 1,
    borderColor: adminColors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    opacity: 0.35,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: adminColors.primary,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phone: {
    fontSize: 16,
    fontWeight: '600',
    color: adminColors.text,
  },
  meta: {
    fontSize: 14,
    color: adminColors.textMuted,
    textAlign: 'center',
  },
  visibilityCard: {
    marginHorizontal: 16,
    marginTop: 4,
    padding: 12,
    borderRadius: 12,
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.border,
    gap: 6,
  },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  visibilityLabel: {
    flex: 1,
    color: adminColors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  visibilityHint: {
    color: adminColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  exportWrap: {
    marginHorizontal: 16,
  },
  formWrap: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'visible',
    backgroundColor: '#F3F7FC',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
