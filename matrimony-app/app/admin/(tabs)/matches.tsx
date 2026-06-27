import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminLanguageToggle } from '@/components/admin/AdminLanguageToggle';
import { AdminScreenShell } from '@/components/admin/AdminScreenShell';
import { adminColors } from '@/constants/admin';
import { adminFilterLabelKeys } from '@/constants/adminLabels';
import { getFormOptions } from '@/constants/formOptions';
import { images } from '@/constants/images';
import { getAdminProfilePhotoUri } from '@/constants/profilePhotos';
import { useLanguage } from '@/context/LanguageContext';
import { findHinduRegistrationStar, getRegistrationNatchathiramOptions } from '@/constants/registrationNumbers';
import { deleteProfileByPhone, listAllProfiles, buildPhotoApprovalSlotsByPhone } from '@/lib/firestore/profileService';
import type { FirestoreProfileDoc } from '@/lib/firestore/collections';

type ProfileFilter = 'all' | 'male' | 'female';
type HoroscopeFilter = 'all' | string;

const genderFilters: ProfileFilter[] = ['all', 'male', 'female'];

type FilterOption = { value: string; label: string };

function FilterDropdownChip({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onValueChange: (nextValue: string) => void;
}) {
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number } | null>(null);
  const active = value !== 'all';

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setAnchor(null);
  }, []);

  const openDropdown = useCallback(() => {
    const measure = () => {
      triggerRef.current?.measureInWindow((x, y, width, height) => {
        if (width <= 0 || height <= 0) {
          return;
        }
        setAnchor({
          top: y + height + 4,
          left: x,
          width: Math.max(width, 180),
        });
        setOpen(true);
      });
    };

    if (Platform.OS === 'web') {
      measure();
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(measure);
    });
  }, []);

  const handleToggle = useCallback(() => {
    if (open) {
      closeDropdown();
      return;
    }
    openDropdown();
  }, [closeDropdown, open, openDropdown]);

  const handleSelect = useCallback(
    (nextValue: string) => {
      onValueChange(nextValue);
      closeDropdown();
    },
    [closeDropdown, onValueChange],
  );

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          style={[styles.chip, styles.dropdownChip, active && styles.chipActive]}
          onPress={handleToggle}
        >
          <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
            {label}
          </Text>
          <MaterialIcons
            name={open ? 'expand-less' : 'expand-more'}
            size={16}
            color={active ? '#fff' : adminColors.textMuted}
          />
        </Pressable>
      </View>

      {open && anchor ? (
        <Modal visible transparent animationType="fade" onRequestClose={closeDropdown} statusBarTranslucent>
          <View style={styles.dropdownModalRoot}>
            <Pressable style={styles.dropdownModalBackdrop} onPress={closeDropdown} />
            <View
              pointerEvents="box-none"
              style={[
                styles.dropdownModalPanel,
                { top: anchor.top, left: anchor.left, width: anchor.width },
              ]}
            >
              <ScrollView
                style={styles.dropdownList}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={options.length > 6}
              >
                {options.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <Pressable
                      key={option.value}
                      style={[styles.dropdownOption, isSelected && styles.dropdownOptionSelected]}
                      onPress={() => handleSelect(option.value)}
                    >
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          isSelected && styles.dropdownOptionTextSelected,
                        ]}
                        numberOfLines={2}
                      >
                        {option.label}
                      </Text>
                      {isSelected ? (
                        <MaterialIcons name="check" size={16} color={adminColors.primary} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
}

function profilePhoto(
  profile: FirestoreProfileDoc,
  approvalSlotsByPhone: Map<string, string[]>,
): string {
  const phone = profile.phone.replace(/\D/g, '');
  const approvalSlots = approvalSlotsByPhone.get(phone) ?? [];
  return getAdminProfilePhotoUri(
    profile,
    Platform.OS === 'web' ? 'web' : 'native',
    approvalSlots,
  );
}

function profileRasi(profile: FirestoreProfileDoc): string {
  return (profile.biodata?.rasi ?? '').trim();
}

function profileStar(profile: FirestoreProfileDoc): string {
  return (profile.biodata?.natchathiram ?? profile.biodata?.nakshatra ?? '').trim();
}

function profileMatchesRasi(profile: FirestoreProfileDoc, rasiFilter: string): boolean {
  if (rasiFilter === 'all') {
    return true;
  }
  return profileRasi(profile) === rasiFilter;
}

function profileMatchesStar(profile: FirestoreProfileDoc, starFilter: string): boolean {
  if (starFilter === 'all') {
    return true;
  }

  const storedStar = profileStar(profile);
  if (!storedStar) {
    return false;
  }

  if (storedStar === starFilter) {
    return true;
  }

  const resolved = findHinduRegistrationStar(storedStar, profileRasi(profile));
  return resolved?.id === starFilter;
}

export default function AdminMatchesScreen() {
  const router = useRouter();
  const { translate, translateFormat, language } = useLanguage();
  const [profiles, setProfiles] = useState<FirestoreProfileDoc[]>([]);
  const [approvalSlotsByPhone, setApprovalSlotsByPhone] = useState<Map<string, string[]>>(
    () => new Map(),
  );
  const [genderFilter, setGenderFilter] = useState<ProfileFilter>('all');
  const [rasiFilter, setRasiFilter] = useState<HoroscopeFilter>('all');
  const [starFilter, setStarFilter] = useState<HoroscopeFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhones, setSelectedPhones] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedPhones([]);
  }, []);

  const enterSelectionMode = useCallback(() => {
    setSelectionMode(true);
    setSelectedPhones([]);
  }, []);

  const toggleProfileSelection = useCallback((phone: string) => {
    setSelectedPhones((current) =>
      current.includes(phone) ? current.filter((entry) => entry !== phone) : [...current, phone],
    );
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [entries, approvalSlots] = await Promise.all([
        listAllProfiles(),
        buildPhotoApprovalSlotsByPhone(),
      ]);

      setApprovalSlotsByPhone(approvalSlots);
      setProfiles(
        entries.filter(
          (profile) =>
            profile.published &&
            profile.accountStatus !== 'blocked' &&
            profile.accountStatus !== 'deleted' &&
            profile.approvalStatus !== 'rejected',
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedPhones.length === 0 || isDeleting) {
      return;
    }

    Alert.alert(
      translate('adminMatchesDeleteMultipleTitle'),
      translateFormat('adminMatchesDeleteMultipleBody', { count: selectedPhones.length }),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('adminDelete'),
          style: 'destructive',
          onPress: () => {
            setIsDeleting(true);
            void Promise.all(selectedPhones.map((phone) => deleteProfileByPhone(phone)))
              .then(() => {
                Alert.alert(
                  translate('adminMatchesDeleteMultipleTitle'),
                  translateFormat('adminMatchesDeleteSuccess', { count: selectedPhones.length }),
                );
                exitSelectionMode();
                return refresh();
              })
              .finally(() => {
                setIsDeleting(false);
              });
          },
        },
      ],
    );
  }, [exitSelectionMode, isDeleting, refresh, selectedPhones, translate, translateFormat]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const rasiOptions = useMemo(
    () => [
      { value: 'all', label: translate('adminFilterAll') },
      ...getFormOptions('rasi', language),
    ],
    [language, translate],
  );

  const starOptions = useMemo(
    () => [
      { value: 'all', label: translate('adminFilterAll') },
      ...getRegistrationNatchathiramOptions(language, rasiFilter === 'all' ? '' : rasiFilter),
    ],
    [language, rasiFilter, translate],
  );

  const handleRasiFilterChange = useCallback(
    (value: string) => {
      setRasiFilter(value);
      if (value !== 'all' && starFilter !== 'all') {
        const star = findHinduRegistrationStar(starFilter, value);
        if (!star) {
          setStarFilter('all');
        }
      }
    },
    [starFilter],
  );

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      if (genderFilter !== 'all' && profile.gender !== genderFilter) {
        return false;
      }
      if (!profileMatchesRasi(profile, rasiFilter)) {
        return false;
      }
      if (!profileMatchesStar(profile, starFilter)) {
        return false;
      }
      return true;
    });
  }, [genderFilter, profiles, rasiFilter, starFilter]);

  const openProfile = (phone: string) => {
    router.push(`/admin/view-profile/${phone}` as never);
  };

  const handleProfilePress = (phone: string) => {
    if (selectionMode) {
      toggleProfileSelection(phone);
      return;
    }
    openProfile(phone);
  };

  return (
    <AdminScreenShell
      title={translate('adminMatches')}
      headerRight={
        <View style={styles.headerActions}>
          <Pressable
            style={[
              styles.headerDeleteBtn,
              !isLoading && filteredProfiles.length === 0 && !selectionMode && styles.headerDeleteBtnDisabled,
            ]}
            onPress={() => {
              if (!selectionMode && filteredProfiles.length === 0) {
                return;
              }
              if (selectionMode) {
                exitSelectionMode();
              } else {
                enterSelectionMode();
              }
            }}
            disabled={!isLoading && filteredProfiles.length === 0 && !selectionMode}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              selectionMode ? translate('adminMatchesCancelSelect') : translate('adminDelete')
            }
          >
            <MaterialIcons
              name={selectionMode ? 'close' : 'delete-outline'}
              size={22}
              color={selectionMode ? adminColors.text : adminColors.danger}
            />
          </Pressable>
          <AdminLanguageToggle />
        </View>
      }
      pinnedContent={
        selectionMode ? (
          <View style={styles.selectionBar}>
            <Text style={styles.selectionCount}>
              {selectedPhones.length > 0
                ? translateFormat('adminMatchesDeleteSelected', { count: selectedPhones.length })
                : translate('adminMatchesCancelSelect')}
            </Text>
            <View style={styles.selectionActions}>
              <Pressable style={styles.selectionCancelBtn} onPress={exitSelectionMode} hitSlop={8}>
                <Text style={styles.selectionCancelText}>{translate('adminMatchesCancelSelect')}</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.selectionDeleteBtn,
                  (selectedPhones.length === 0 || isDeleting) && styles.selectionDeleteBtnDisabled,
                ]}
                onPress={handleDeleteSelected}
                disabled={selectedPhones.length === 0 || isDeleting}
                hitSlop={8}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.selectionDeleteText}>{translate('adminDelete')}</Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : null
      }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {genderFilters.map((item) => {
          const active = genderFilter === item;
          return (
            <Pressable
              key={item}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setGenderFilter(item)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {translate(adminFilterLabelKeys[item])}
              </Text>
            </Pressable>
          );
        })}

        <FilterDropdownChip
          label={translate('biodataFieldRasi')}
          value={rasiFilter}
          options={rasiOptions}
          onValueChange={handleRasiFilterChange}
        />

        <FilterDropdownChip
          label={translate('star')}
          value={starFilter}
          options={starOptions}
          onValueChange={setStarFilter}
        />
      </ScrollView>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={adminColors.primary} />
        </View>
      ) : filteredProfiles.length === 0 ? (
        <AdminEmptyState
          icon="favorite"
          title={translate('adminNoProfilesToShow')}
          message={translate('adminNoProfilesMessage')}
        />
      ) : (
        <View style={styles.grid}>
          {filteredProfiles.map((profile) => {
            const photo = profilePhoto(profile, approvalSlotsByPhone);
            const isSelected = selectedPhones.includes(profile.phone);
            return (
              <Pressable
                key={profile.phone}
                style={[styles.card, selectionMode && isSelected && styles.cardSelected]}
                onPress={() => handleProfilePress(profile.phone)}
              >
                {selectionMode ? (
                  <View style={[styles.selectBox, isSelected && styles.selectBoxSelected]}>
                    {isSelected ? (
                      <MaterialIcons name="check" size={16} color="#fff" />
                    ) : null}
                  </View>
                ) : null}
                <View style={styles.cardImageWrap}>
                  {photo ? (
                    <Image source={{ uri: photo }} style={styles.cardImage} resizeMode="cover" />
                  ) : (
                    <Image source={images.logo} style={styles.cardPlaceholder} resizeMode="contain" />
                  )}
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {profile.fullName || profile.listing?.name || translate('adminMember')}
                  </Text>
                  <View style={styles.phoneRow}>
                    <MaterialIcons name="phone" size={13} color={adminColors.primary} />
                    <Text style={styles.cardPhone} numberOfLines={1}>
                      {profile.phone}
                    </Text>
                  </View>
                  <Text style={styles.cardMeta} numberOfLines={1}>
                    {profile.registrationCommunity || profile.listing?.community || '—'}
                    {profile.listing?.age ? ` · ${profile.listing.age}` : ''}
                  </Text>
                </View>
                {selectionMode ? null : (
                  <MaterialIcons name="chevron-right" size={20} color={adminColors.textMuted} />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </AdminScreenShell>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.border,
  },
  dropdownChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  chipActive: {
    backgroundColor: adminColors.primary,
    borderColor: adminColors.primary,
  },
  chipText: {
    color: adminColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  dropdownModalRoot: {
    flex: 1,
  },
  dropdownModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  dropdownModalPanel: {
    position: 'absolute',
    maxHeight: 240,
    backgroundColor: adminColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: adminColors.border,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(87, 0, 0, 0.12)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
      },
    }),
  },
  dropdownList: {
    maxHeight: 240,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: adminColors.border,
  },
  dropdownOptionSelected: {
    backgroundColor: adminColors.primaryLight,
  },
  dropdownOptionText: {
    flex: 1,
    fontSize: 13,
    color: adminColors.text,
  },
  dropdownOptionTextSelected: {
    color: adminColors.primary,
    fontWeight: '600',
  },
  loading: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: adminColors.background,
  },
  headerDeleteBtnDisabled: {
    opacity: 0.35,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.border,
  },
  selectionCount: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: adminColors.text,
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectionCancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  selectionCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: adminColors.textMuted,
  },
  selectionDeleteBtn: {
    minWidth: 72,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: adminColors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionDeleteBtnDisabled: {
    opacity: 0.45,
  },
  selectionDeleteText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  grid: {
    gap: 10,
    paddingBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: adminColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: adminColors.border,
    padding: 10,
  },
  cardSelected: {
    borderColor: adminColors.primary,
    backgroundColor: adminColors.primaryLight,
  },
  selectBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: adminColors.border,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  selectBoxSelected: {
    borderColor: adminColors.primary,
    backgroundColor: adminColors.primary,
  },
  cardImageWrap: {
    width: 64,
    height: 78,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: adminColors.primaryLight,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardPlaceholder: {
    width: '100%',
    height: '100%',
    opacity: 0.35,
  },
  cardBody: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: adminColors.text,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardPhone: {
    fontSize: 13,
    fontWeight: '600',
    color: adminColors.text,
  },
  cardMeta: {
    fontSize: 12,
    color: adminColors.textMuted,
  },
});
