import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SideMenuDrawer } from '@/components/SideMenuDrawer';
import { PremiumCard } from '@/components/PremiumCard';
import { useLanguage } from '@/context/LanguageContext';
import { useProfileForm } from '@/context/ProfileFormContext';
import {
  getProfileAvatarSource,
  getProfileCompletionPercent,
  getProfileFirstName,
} from '@/constants/profileDisplay';
import { borderRadius, colors, fonts, spacing, typography } from '@/constants/theme';
import { images } from '@/constants/images';
import { filterByRecommendedGender } from '@/constants/matchFilters';

type HomeMatch = (typeof images.matches)[number];

function useCountdownToMidnight() {
  const [timeLeft, setTimeLeft] = useState('00h:00m:00s');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const diff = Math.max(0, end.getTime() - now.getTime());
      const hours = Math.floor(diff / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      const seconds = Math.floor((diff % 60_000) / 1_000);
      setTimeLeft(
        `${String(hours).padStart(2, '0')}h:${String(minutes).padStart(2, '0')}m:${String(seconds).padStart(2, '0')}s`,
      );
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return timeLeft;
}

export default function HomeScreen() {
  const router = useRouter();
  const { translate, translateFormat, toggleLanguage } = useLanguage();
  const { values } = useProfileForm();
  const [membershipMode, setMembershipMode] = useState<'regular' | 'prime'>('regular');
  const [menuOpen, setMenuOpen] = useState(false);
  const countdown = useCountdownToMidnight();

  const profileName = getProfileFirstName(values.fullName ?? '') || translate('profile');
  const profileCompletion = getProfileCompletionPercent(values);
  const avatarSource = getProfileAvatarSource(values);
  const userGender = values.gender ?? '';

  const recommendedMatches = useMemo(
    () => filterByRecommendedGender(images.matches, userGender),
    [userGender],
  );
  const recommendedPremiumProfiles = useMemo(
    () => filterByRecommendedGender(images.premiumProfiles, userGender),
    [userGender],
  );

  const profileActions = [
    {
      key: 'photos',
      label: translate('addPhotos'),
      icon: 'add-a-photo' as const,
      tint: '#FCEAE8',
      accent: colors.primary,
      route: '/edit-profile' as Href,
    },
    {
      key: 'verify',
      label: translate('verifyProfile'),
      icon: 'verified-user' as const,
      tint: '#E3F2FD',
      accent: '#1565C0',
      route: '/edit-profile' as Href,
    },
    {
      key: 'horoscope',
      label: translate('addHoroscope'),
      icon: 'brightness-2' as const,
      tint: '#F3E5F5',
      accent: '#6A1B9A',
      route: '/edit-profile' as Href,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <LinearGradient
          colors={[colors.surfaceContainerLowest, '#FFF5F2', colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.topUtilityRow}>
            <View style={styles.membershipToggleWrap}>
              <View style={styles.membershipToggle}>
              <Pressable
                style={[styles.togglePill, membershipMode === 'regular' && styles.togglePillActive]}
                onPress={() => setMembershipMode('regular')}
              >
                <Text
                  style={[
                    styles.toggleText,
                    membershipMode === 'regular' && styles.toggleTextActive,
                  ]}
                >
                  {translate('regular')}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.togglePill, membershipMode === 'prime' && styles.togglePillActive]}
                onPress={() => setMembershipMode('prime')}
              >
                <Text
                  style={[styles.toggleText, membershipMode === 'prime' && styles.toggleTextActive]}
                >
                  {translate('prime')}
                </Text>
                <View style={styles.primeDot} />
              </Pressable>
              </View>
            </View>

            <View style={styles.topIconRow}>
              <Pressable style={styles.iconCircle} onPress={toggleLanguage} hitSlop={8}>
                <MaterialIcons name="translate" size={20} color={colors.onSurface} />
              </Pressable>
              <Pressable
                style={styles.iconCircle}
                onPress={() => router.push('/(tabs)/matches')}
                hitSlop={8}
              >
                <MaterialIcons name="search" size={20} color={colors.onSurface} />
              </Pressable>
            </View>
          </View>

          <View style={styles.profileRow}>
            <Pressable style={styles.avatarWrap} onPress={() => router.push('/edit-profile')}>
              <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
              <View style={styles.cameraBadge}>
                <MaterialIcons name="photo-camera" size={14} color="#fff" />
              </View>
            </Pressable>

            <View style={styles.profileMeta}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{profileName}</Text>
                <Image source={images.logo} style={styles.brandLogo} resizeMode="contain" />
              </View>
              <View style={styles.memberRow}>
                <Text style={styles.memberType}>{translate('freeMember')}</Text>
                <Pressable
                  style={styles.upgradePill}
                  onPress={() => router.push('/upgrade')}
                >
                  <Text style={styles.upgradeText}>{translate('upgrade')}</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.profileActions}>
              <Pressable style={styles.iconCircle} onPress={() => router.push('/notifications')} hitSlop={8}>
                <MaterialIcons name="notifications-none" size={22} color={colors.onSurface} />
              </Pressable>
              <Pressable style={styles.iconCircle} onPress={() => setMenuOpen(true)} hitSlop={8}>
                <MaterialIcons name="menu" size={22} color={colors.onSurface} />
              </Pressable>
            </View>
          </View>

        </LinearGradient>

        <View style={styles.completeSection}>
          <Text style={styles.sectionHeading}>{translate('completeYourProfile')}</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>
              {translateFormat('profileCompletenessScore', { percent: profileCompletion })}
            </Text>
            <View style={styles.scoreTrack}>
              <View style={[styles.scoreFill, { width: `${profileCompletion}%` }]} />
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actionCardsRow}
          >
            {profileActions.map((action) => (
              <Pressable
                key={action.key}
                style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
                onPress={() => router.push(action.route)}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: action.tint }]}>
                  <MaterialIcons name={action.icon} size={28} color={action.accent} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWrap}>
              <MaterialIcons name="workspace-premium" size={20} color={colors.secondary} />
              <Text style={styles.sectionTitle}>{translate('premiumProfiles')}</Text>
            </View>
            <Pressable onPress={() => router.push('/(tabs)/matches')}>
              <Text style={styles.viewAll}>{translate('viewAll')}</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {recommendedPremiumProfiles.map((profile) => (
              <PremiumCard key={profile.name} {...profile} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.dailyHeaderText}>
              <Text style={styles.sectionHeadingDark}>{translate('dailyRecommendations')}</Text>
              <Text style={styles.sectionSubtitle}>{translate('recommendedToday')}</Text>
            </View>
            <Pressable onPress={() => router.push('/(tabs)/matches')}>
              <Text style={styles.viewAll}>{translate('viewAll')}</Text>
            </Pressable>
          </View>
          <View style={styles.countdownRow}>
            <View style={styles.countdownBadge}>
              <Text style={styles.countdownLabel}>{translate('timeLeftToView')}</Text>
              <Text style={styles.countdownValue}>{countdown}</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {recommendedMatches.map((match) => (
              <HomeRecommendationCard key={match.id} match={match} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.homePromoSection}>
          <Text style={styles.homePromoAllMatchesTitle}>
            {translateFormat('allMatchesSectionTitle', {
              count: recommendedMatches.length.toLocaleString(),
            })}
          </Text>
          <Text style={styles.homePromoAllMatchesSubtitle}>
            {translate('allMatchesSectionSubtitle')}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.homePromoMatchList}
          >
            {recommendedMatches.map((match) => (
              <HomeAllMatchPreviewCard key={`all-${match.id}`} match={match} />
            ))}
          </ScrollView>

          <Pressable
            style={styles.homePromoViewAllBtn}
            onPress={() => router.push('/(tabs)/matches')}
          >
            <Text style={styles.homePromoViewAllText}>{translate('viewAllChevron')}</Text>
          </Pressable>

          <View style={styles.homePromoPlanCard}>
            <View style={styles.homePromoPlanBadge}>
              <MaterialIcons name="bolt" size={14} color="#7B1FA2" />
              <Text style={styles.homePromoPlanBadgeText}>{translate('highlyRecommended')}</Text>
            </View>

            <View style={styles.homePromoPlanContent}>
              <View style={styles.homePromoPlanCopy}>
                <Text style={styles.homePromoPlanTitle}>{translate('tillUMarryPlanQuote')}</Text>
                <Text style={styles.homePromoPlanTagline}>{translate('tillUMarryPlanTagline')}</Text>

                <View style={styles.homePromoPriceRow}>
                  <Text style={styles.homePromoPriceStrike}>₹23,700</Text>
                  <Text style={styles.homePromoPriceOffer}>₹8,600</Text>
                </View>

                <View style={styles.homePromoFeatureList}>
                  {(
                    [
                      'featureCallWhatsappMatches',
                      'featureUnlimitedMessages',
                      'featureLongestValidityPlan',
                    ] as const
                  ).map((key) => (
                    <View key={key} style={styles.homePromoFeatureRow}>
                      <MaterialIcons name="check" size={16} color={colors.onSurface} />
                      <Text style={styles.homePromoFeatureText}>{translate(key)}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  style={styles.homePromoUpgradeBtn}
                  onPress={() => router.push('/upgrade')}
                >
                  <Text style={styles.homePromoUpgradeBtnText}>
                    {translate('upgradeMembership')}
                  </Text>
                </Pressable>
                <Text style={styles.homePromoOfferEnds}>{translate('offerEndsToday')}</Text>
              </View>

              <Image
                source={{ uri: images.tillUMarryPromo }}
                style={styles.homePromoPlanImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <SideMenuDrawer visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}

function HomeAllMatchPreviewCard({ match }: { match: HomeMatch }) {
  const router = useRouter();
  const ageLine = match.age.replace(/\s*Years?/gi, ' Yrs');

  return (
    <Pressable
      style={styles.homePromoMatchCard}
      onPress={() => router.push({ pathname: '/member/[id]', params: { id: match.id } })}
    >
      <Image source={{ uri: match.image }} style={styles.homePromoMatchImage} />
      <Text style={styles.homePromoMatchName} numberOfLines={1}>
        {match.name.split(' ')[0]}
      </Text>
      <Text style={styles.homePromoMatchMeta} numberOfLines={1}>
        {ageLine}
      </Text>
    </Pressable>
  );
}

function HomeRecommendationCard({ match }: { match: HomeMatch }) {
  const router = useRouter();
  const { translate } = useLanguage();

  return (
    <View style={styles.recommendCard}>
      <Pressable
        style={styles.recommendCardPressable}
        onPress={() => router.push({ pathname: '/member/[id]', params: { id: match.id } })}
      >
        <Image source={{ uri: match.image }} style={styles.recommendImage} />
        {match.verified ? (
          <View style={styles.crownBadge}>
            <MaterialIcons name="workspace-premium" size={14} color="#fff" />
          </View>
        ) : null}
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.recommendGradient} />
        <View style={styles.recommendFooter}>
          <Text style={styles.recommendName} numberOfLines={1}>
            {match.name}
          </Text>
          <Text style={styles.recommendMeta} numberOfLines={1}>
            {match.age}
          </Text>
        </View>
      </Pressable>
      <View style={styles.recommendActions}>
        <Pressable style={styles.recommendOutlineBtn}>
          <MaterialIcons name="star-outline" size={14} color={colors.primary} />
        </Pressable>
        <Pressable style={styles.recommendPrimaryBtn}>
          <MaterialIcons name="favorite" size={14} color={colors.onPrimary} />
          <Text style={styles.recommendPrimaryText}>{translate('interest')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  heroGradient: {
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  topUtilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    minHeight: 36,
    marginBottom: spacing.md,
  },
  membershipToggleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  membershipToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.primaryContainer,
  },
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  togglePillActive: {
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  toggleText: {
    ...typography.labelSm,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
  },
  toggleTextActive: {
    color: colors.primary,
  },
  primeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
  },
  topIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 0,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileMeta: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontSize: 18,
  },
  brandLogo: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  memberType: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  upgradePill: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: '#fff',
  },
  upgradeText: {
    ...typography.labelSm,
    color: colors.secondary,
    fontSize: 11,
  },
  profileActions: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  completeSection: {
    backgroundColor: '#fff',
    marginTop: 0,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.containerMargin,
  },
  sectionHeading: {
    ...typography.titleLg,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  scoreRow: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  scoreLabel: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  scoreTrack: {
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.outlineVariant,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    backgroundColor: '#E8503A',
    borderRadius: borderRadius.full,
  },
  actionCardsRow: {
    gap: spacing.sm,
    paddingRight: spacing.containerMargin,
  },
  actionCard: {
    width: 118,
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionCardPressed: {
    opacity: 0.92,
  },
  actionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    ...typography.labelSm,
    color: colors.onSurface,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
  },
  sectionBlock: {
    backgroundColor: '#fff',
    marginTop: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.containerMargin,
    marginBottom: spacing.md,
  },
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
  },
  viewAll: {
    ...typography.labelLg,
    color: colors.surfaceTint,
  },
  horizontalList: {
    paddingHorizontal: spacing.containerMargin,
  },
  dailyHeaderText: {
    flex: 1,
    gap: 2,
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.containerMargin,
    marginBottom: spacing.md,
  },
  sectionHeadingDark: {
    ...typography.titleLg,
    color: colors.onSurface,
  },
  sectionSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  countdownBadge: {
    backgroundColor: colors.surfaceTint,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    minWidth: 112,
  },
  countdownLabel: {
    ...typography.labelSm,
    color: '#fff',
    fontSize: 10,
  },
  countdownValue: {
    ...typography.labelLg,
    color: '#fff',
    fontFamily: fonts.interSemi,
    fontSize: 13,
  },
  recommendCard: {
    width: 148,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginRight: spacing.sm,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  recommendCardPressable: {
    height: 176,
    overflow: 'hidden',
  },
  recommendImage: {
    width: '100%',
    height: '100%',
  },
  recommendGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  crownBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(115, 92, 0, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.sm,
  },
  recommendName: {
    ...typography.labelLg,
    color: '#fff',
    fontFamily: fonts.interSemi,
  },
  recommendMeta: {
    ...typography.labelSm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  recommendActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: spacing.xs,
  },
  recommendOutlineBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(226, 191, 185, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendPrimaryBtn: {
    flex: 1,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  recommendPrimaryText: {
    ...typography.labelSm,
    color: colors.onPrimary,
    fontSize: 11,
  },
  homePromoSection: {
    backgroundColor: '#fff',
    marginTop: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.containerMargin,
    gap: spacing.sm,
  },
  homePromoAllMatchesTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontFamily: fonts.interSemi,
    fontSize: 20,
  },
  homePromoAllMatchesSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  homePromoMatchList: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  homePromoMatchCard: {
    width: 108,
    alignItems: 'center',
  },
  homePromoMatchImage: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerHigh,
    marginBottom: spacing.xs,
  },
  homePromoMatchName: {
    ...typography.labelLg,
    color: colors.onSurface,
    fontFamily: fonts.interSemi,
    fontSize: 13,
    textAlign: 'center',
    width: '100%',
  },
  homePromoMatchMeta: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontSize: 11,
    textAlign: 'center',
    width: '100%',
  },
  homePromoViewAllBtn: {
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#F57C00',
    backgroundColor: '#fff',
  },
  homePromoViewAllText: {
    ...typography.labelLg,
    color: '#F57C00',
    fontFamily: fonts.interSemi,
    fontSize: 14,
  },
  homePromoPlanCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#EAF6FF',
    borderWidth: 1,
    borderColor: '#D6ECFA',
    padding: spacing.md,
  },
  homePromoPlanBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  homePromoPlanBadgeText: {
    ...typography.labelSm,
    color: '#7B1FA2',
    fontSize: 10,
    fontFamily: fonts.interSemi,
    letterSpacing: 0.3,
  },
  homePromoPlanContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  homePromoPlanCopy: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  homePromoPlanTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontFamily: fonts.interSemi,
    fontSize: 22,
    lineHeight: 28,
  },
  homePromoPlanTagline: {
    ...typography.bodyMd,
    color: colors.onSurface,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  homePromoPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  homePromoPriceStrike: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textDecorationLine: 'line-through',
  },
  homePromoPriceOffer: {
    ...typography.headlineMd,
    color: '#C2185B',
    fontFamily: fonts.interSemi,
    fontSize: 28,
  },
  homePromoFeatureList: {
    gap: 6,
    marginBottom: spacing.md,
  },
  homePromoFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  homePromoFeatureText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontSize: 13,
    flex: 1,
  },
  homePromoUpgradeBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#F57C00',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    marginBottom: spacing.xs,
  },
  homePromoUpgradeBtnText: {
    ...typography.labelLg,
    color: '#fff',
    fontFamily: fonts.interSemi,
    fontSize: 14,
  },
  homePromoOfferEnds: {
    ...typography.labelSm,
    color: colors.onSurface,
    fontSize: 12,
  },
  homePromoPlanImage: {
    width: 118,
    height: 168,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
});
