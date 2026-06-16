import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/context/LanguageContext';
import { useProfileForm } from '@/context/ProfileFormContext';
import { borderRadius, colors, fonts, spacing, typography } from '@/constants/theme';
import { images } from '@/constants/images';
import { filterByRecommendedGender } from '@/constants/matchFilters';

type MatchProfile = (typeof images.matches)[number];

const palette = {
  headerBg: '#E8F5E9',
  orange: '#F57C00',
  orangeDark: '#E65100',
  pinkSection: '#FCE4EC',
  pinkIcon: '#F48FB1',
  blueVerified: '#1E88E5',
  border: '#E0E0E0',
  muted: '#757575',
  cardShadow: 'rgba(0,0,0,0.08)',
};

function formatMemberId(id: string) {
  return `M${id.padStart(8, '0')}`;
}

function parseAgeHeight(age: string) {
  const parts = age.split(',').map((part) => part.trim());
  const agePart = parts[0]?.replace(/\s*Years?/i, ' yrs') ?? age;
  const heightPart = parts[1] ?? '';
  return { agePart, heightPart };
}

function InfoSection({
  icon,
  title,
  children,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.infoSection}>
      <View style={styles.infoSectionHeader}>
        <View style={styles.infoSectionIconWrap}>
          <MaterialIcons name={icon} size={18} color={palette.orangeDark} />
        </View>
        <Text style={styles.infoSectionTitle}>{title}</Text>
      </View>
      <View style={styles.infoSectionBody}>{children}</View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoColon}>:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function LockedInfoRow({
  label,
  upgradeLabel,
  onUpgrade,
}: {
  label: string;
  upgradeLabel: string;
  onUpgrade: () => void;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoColon}>:</Text>
      <Pressable style={styles.upgradeRow} onPress={onUpgrade}>
        <MaterialIcons name="lock" size={14} color={palette.orange} />
        <Text style={styles.upgradeText}>{upgradeLabel}</Text>
        <MaterialIcons name="chevron-right" size={16} color={palette.orange} />
      </Pressable>
    </View>
  );
}

function DailyRecommendationCard({
  match,
  onUpgrade,
}: {
  match: MatchProfile;
  onUpgrade: () => void;
}) {
  const router = useRouter();
  const { translate, translateFormat } = useLanguage();
  const { agePart, heightPart } = parseAgeHeight(match.age);
  const communityShort = match.community.split(',')[0]?.trim() ?? match.community;
  const firstName = match.name.split(' ')[0] ?? match.name;

  const summaryLine = [
    translate('neverMarried'),
    `${translate('profileCreatedBy')} ${translate('profileCreatedBySelf')}`,
    agePart,
    heightPart,
    communityShort,
    translate('student'),
    match.location.split(',')[0]?.trim() ?? match.location,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <View style={styles.profileCard}>
      <View style={styles.photoSection}>
        <Image source={{ uri: match.image }} style={styles.photo} />
        {match.badge ? (
          <View style={styles.newlyJoinedBadge}>
            <Text style={styles.newlyJoinedText}>{translate('newlyJoined')}</Text>
          </View>
        ) : null}
        <Pressable style={styles.shortlistBtn} hitSlop={8}>
          <MaterialIcons name="bookmark-border" size={16} color="#fff" />
          <Text style={styles.shortlistBtnText}>{translate('shortlist')}</Text>
        </Pressable>
      </View>

      <View style={styles.profileSummary}>
        <View style={styles.verifiedRow}>
          <MaterialIcons name="verified-user" size={18} color={palette.blueVerified} />
          <Text style={styles.verifiedText}>{translate('verified')}</Text>
          <MaterialIcons name="info-outline" size={14} color={palette.muted} />
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.profileName}>{firstName}</Text>
          <View style={styles.contactIcons}>
            <Pressable style={styles.callBtn} hitSlop={6}>
              <MaterialIcons name="call" size={18} color={palette.orange} />
            </Pressable>
            <Pressable style={[styles.callBtn, styles.whatsappBtn]} hitSlop={6}>
              <MaterialIcons name="chat" size={18} color="#25D366" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.metaLine}>
          {formatMemberId(match.id)} • {translate('lastSeenFewHours')}
        </Text>
        <Text style={styles.summaryLine} numberOfLines={2}>
          {summaryLine}
        </Text>
      </View>

      <InfoSection icon="person-outline" title={translate('personalInformation')}>
        <InfoRow label={translate('age')} value={agePart} />
        <InfoRow label={translate('height')} value={heightPart || '—'} />
        <InfoRow label={translate('motherTongue')} value={translate('tamilLanguage')} />
        <InfoRow
          label={translate('profileCreatedBy')}
          value={translate('profileCreatedBySelf')}
        />
        <InfoRow label={translate('maritalStatus')} value={translate('neverMarried')} />
        <InfoRow label={translate('livesIn')} value={match.location} />
        <InfoRow label={translate('eatingHabits')} value={translate('vegetarian')} />
        <InfoRow label={translate('religion')} value={translate('hindu')} />
        <InfoRow label={translate('caste')} value={communityShort} />
        <InfoRow label={translate('gothram')} value={translate('notSpecified')} />
        <LockedInfoRow
          label={translate('dateOfBirth')}
          upgradeLabel={upgradeLabel(translate)}
          onUpgrade={onUpgrade}
        />
        <LockedInfoRow
          label={translate('star')}
          upgradeLabel={upgradeLabel(translate)}
          onUpgrade={onUpgrade}
        />
        <LockedInfoRow
          label={translate('raasi')}
          upgradeLabel={upgradeLabel(translate)}
          onUpgrade={onUpgrade}
        />
        <LockedInfoRow
          label={translate('horoscope')}
          upgradeLabel={upgradeLabel(translate)}
          onUpgrade={onUpgrade}
        />
        <InfoRow label={translate('employment')} value={translate('currentlyNotWorking')} />
        <InfoRow label={translate('education')} value="ME" />
        <InfoRow label={translate('occupation')} value={translate('student')} />
      </InfoSection>

      <InfoSection icon="home" title={translate('familyInformation')}>
        <InfoRow label={translate('familyStatus')} value={translate('middleClass')} />
        <InfoRow label={translate('ancestralOrigin')} value={translate('notSpecified')} />
      </InfoSection>

      <InfoSection icon="phone" title={translate('contactInformation')}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{translate('mobileNumber')}</Text>
          <Text style={styles.infoColon}>:</Text>
          <View style={styles.contactValueCol}>
            <Text style={styles.infoValue}>{translate('maskedPhoneSample')}</Text>
            <Pressable style={styles.upgradeRow} onPress={onUpgrade}>
              <MaterialIcons name="lock" size={14} color={palette.orange} />
              <Text style={styles.upgradeText}>{upgradeLabel(translate)}</Text>
              <MaterialIcons name="chevron-right" size={16} color={palette.orange} />
            </Pressable>
          </View>
        </View>
      </InfoSection>

      <InfoSection icon="face" title={translate('aboutMyself')}>
        <Text style={styles.aboutText}>
          {translateFormat('aboutSampleText', { location: match.location.split(',')[0] ?? match.location })}
        </Text>
      </InfoSection>

      <Pressable
        style={styles.viewProfileLink}
        onPress={() => router.push({ pathname: '/member/[id]', params: { id: match.id } })}
      >
        <Text style={styles.viewProfileLinkText}>{translate('viewProfile')}</Text>
        <MaterialIcons name="chevron-right" size={18} color={palette.orange} />
      </Pressable>
    </View>
  );
}

function upgradeLabel(translate: (key: 'upgradeToView') => string) {
  return `${translate('upgradeToView')} >`;
}

export default function MatchesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { translate, translateFormat } = useLanguage();
  const { getValue } = useProfileForm();
  const userGender = getValue('gender');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  const genderFilteredMatches = useMemo(
    () => filterByRecommendedGender(images.matches, userGender),
    [userGender],
  );

  const visibleMatches = useMemo(
    () => genderFilteredMatches.filter((match) => !hiddenIds.includes(match.id)),
    [genderFilteredMatches, hiddenIds],
  );

  useEffect(() => {
    if (visibleMatches.length === 0) {
      setCurrentIndex(0);
      return;
    }
    if (currentIndex >= visibleMatches.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, visibleMatches.length]);

  const activeMatch = visibleMatches[currentIndex] ?? null;
  const totalCount = visibleMatches.length;
  const displayIndex = totalCount > 0 ? currentIndex + 1 : 0;

  const goToNext = useCallback(() => {
    if (totalCount <= 1) {
      return;
    }
    setCurrentIndex((index) => (index + 1) % totalCount);
  }, [totalCount]);

  const handleDontShow = useCallback(() => {
    if (!activeMatch) {
      return;
    }
    setHiddenIds((ids) => [...ids, activeMatch.id]);
  }, [activeMatch]);

  const handleUpgrade = useCallback(() => {
    router.push('/upgrade');
  }, [router]);

  const headerTitle = translateFormat('dailyRecommendationTitle', {
    current: String(displayIndex),
    total: String(Math.max(genderFilteredMatches.length, totalCount)),
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
      </View>

      {activeMatch ? (
        <>
          <View style={styles.contentWrap}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <DailyRecommendationCard match={activeMatch} onUpgrade={handleUpgrade} />
            </ScrollView>

            {totalCount > 1 ? (
              <Pressable style={styles.nextFab} onPress={goToNext} hitSlop={8}>
                <MaterialIcons name="chevron-right" size={24} color={colors.onSurface} />
              </Pressable>
            ) : null}

            <View style={styles.scrollHint}>
              <MaterialIcons name="keyboard-arrow-down" size={16} color={palette.muted} />
              <Text style={styles.scrollHintText}>{translate('scrollHint')}</Text>
            </View>
          </View>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
            <View style={styles.footerRow}>
              <Pressable style={styles.dontShowBtn} onPress={handleDontShow}>
                <MaterialIcons name="close" size={18} color={palette.muted} />
                <Text style={styles.dontShowText}>{translate('dontShow')}</Text>
              </Pressable>
              <Pressable style={styles.skipBtn} onPress={goToNext}>
                <MaterialIcons name="fast-forward" size={18} color={palette.orange} />
                <Text style={styles.skipText}>{translate('skip')}</Text>
              </Pressable>
            </View>
            <Pressable style={styles.sendInterestBtn}>
              <MaterialIcons name="favorite" size={20} color="#fff" />
              <Text style={styles.sendInterestText}>{translate('sendInterest')}</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="favorite-border" size={48} color={palette.muted} />
          <Text style={styles.emptyTitle}>{translate('noMoreRecommendations')}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.headerBg,
  },
  header: {
    backgroundColor: palette.headerBg,
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  headerTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontFamily: fonts.interSemi,
    fontSize: 18,
  },
  contentWrap: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  photoSection: {
    position: 'relative',
    width: '100%',
    aspectRatio: 0.78,
    backgroundColor: colors.surfaceContainerHigh,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  newlyJoinedBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#EC407A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomRightRadius: borderRadius.sm,
  },
  newlyJoinedText: {
    ...typography.labelSm,
    color: '#fff',
    fontSize: 10,
    fontFamily: fonts.interSemi,
  },
  shortlistBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  shortlistBtnText: {
    ...typography.labelSm,
    color: '#fff',
    fontSize: 11,
  },
  profileSummary: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    ...typography.labelLg,
    color: palette.blueVerified,
    fontFamily: fonts.interSemi,
    fontSize: 13,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  profileName: {
    ...typography.headlineMd,
    fontSize: 22,
    color: colors.onSurface,
    fontFamily: fonts.interSemi,
    flex: 1,
  },
  contactIcons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.orange,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  whatsappBtn: {
    borderColor: '#25D366',
  },
  metaLine: {
    ...typography.labelSm,
    color: palette.muted,
  },
  summaryLine: {
    ...typography.bodyMd,
    color: palette.muted,
    lineHeight: 20,
  },
  infoSection: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  infoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.pinkSection,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoSectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSectionTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
    fontFamily: fonts.interSemi,
    fontSize: 14,
  },
  infoSectionBody: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  infoLabel: {
    ...typography.bodyMd,
    color: palette.muted,
    width: 118,
    flexShrink: 0,
  },
  infoColon: {
    ...typography.bodyMd,
    color: palette.muted,
    width: 8,
  },
  infoValue: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontFamily: fonts.interSemi,
    flex: 1,
  },
  upgradeRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  upgradeText: {
    ...typography.labelLg,
    color: palette.orange,
    fontSize: 13,
  },
  contactValueCol: {
    flex: 1,
    gap: 4,
  },
  aboutText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    lineHeight: 22,
  },
  viewProfileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.md,
  },
  viewProfileLinkText: {
    ...typography.labelLg,
    color: palette.orange,
    fontFamily: fonts.interSemi,
  },
  nextFab: {
    position: 'absolute',
    right: spacing.xs,
    top: '38%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  scrollHint: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: palette.border,
  },
  scrollHintText: {
    ...typography.labelSm,
    color: palette.muted,
    fontSize: 11,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
    gap: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dontShowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: '#fff',
  },
  dontShowText: {
    ...typography.labelLg,
    color: palette.muted,
    fontSize: 14,
  },
  skipBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: palette.orange,
    backgroundColor: '#fff',
  },
  skipText: {
    ...typography.labelLg,
    color: palette.orange,
    fontSize: 14,
    fontFamily: fonts.interSemi,
  },
  sendInterestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: borderRadius.full,
    backgroundColor: palette.orange,
  },
  sendInterestText: {
    ...typography.labelLg,
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.interSemi,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.containerMargin,
    backgroundColor: '#F5F5F5',
  },
  emptyTitle: {
    ...typography.bodyMd,
    color: palette.muted,
    textAlign: 'center',
  },
});
