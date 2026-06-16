import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/context/LanguageContext';
import { useProfileForm } from '@/context/ProfileFormContext';
import { borderRadius, colors, fonts, spacing, typography } from '@/constants/theme';
import { images } from '@/constants/images';
import { filterByRecommendedGender } from '@/constants/matchFilters';

type DirectionTab = 'received' | 'sent';
type StatusFilter = 'all' | 'pending' | 'accepted' | 'declined';

type InterestItem = {
  id: string;
  name: string;
  image: string;
  summaryLine: string;
  profession: string;
  salary: string;
  location: string;
  interestDate: string;
  direction: DirectionTab;
  filterStatus: StatusFilter;
  pronoun: 'he' | 'she';
};

function formatProfileSummary(age: string, community: string) {
  const parts = age.split(',').map((part) => part.trim());
  const agePart = parts[0]?.replace(/\s*Years?/i, ' yrs') ?? age;
  const heightPart = parts[1];
  const communityShort = community.split(',')[0]?.trim() ?? community;
  return heightPart
    ? `${agePart} · ${heightPart} · ${communityShort} · B.Tech.`
    : `${agePart} · ${communityShort}`;
}

function InterestCard({ item }: { item: InterestItem }) {
  const router = useRouter();
  const { translate, translateFormat } = useLanguage();

  const openProfile = () => {
    router.push({ pathname: '/member/[id]', params: { id: item.id } });
  };

  const sentMessage =
    item.pronoun === 'she'
      ? translateFormat('sheSentYouInterest', { date: item.interestDate })
      : translateFormat('heSentYouInterest', { date: item.interestDate });

  const hintMessage =
    item.pronoun === 'she'
      ? translate('acceptInterestHintHer')
      : translate('acceptInterestHintHis');

  return (
    <View style={styles.interestCard}>
      <View style={styles.cardTopRow}>
        <Pressable onPress={openProfile}>
          <Image source={{ uri: item.image }} style={styles.cardAvatar} />
        </Pressable>

        <View style={styles.cardInfo}>
          <View style={styles.cardNameRow}>
            <Pressable onPress={openProfile} style={styles.namePressable}>
              <Text style={styles.cardName}>{item.name}</Text>
            </Pressable>
            <Pressable hitSlop={8} style={styles.cardMenuBtn}>
              <MaterialIcons name="more-vert" size={22} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>

          <Text style={styles.summaryLine}>{item.summaryLine}</Text>
          <Text style={styles.detailLine}>{item.profession}</Text>
          <Text style={styles.detailLine}>{item.salary}</Text>
          <Text style={styles.detailLine}>{item.location}</Text>
        </View>
      </View>

      {item.direction === 'received' && item.filterStatus === 'pending' ? (
        <View style={styles.statusBlock}>
          <Text style={styles.statusTitle}>{sentMessage}</Text>
          <Text style={styles.statusHint}>{hintMessage}</Text>
        </View>
      ) : null}

      {item.direction === 'received' && item.filterStatus === 'pending' ? (
        <View style={styles.cardActions}>
          <Pressable style={styles.declineBtn}>
            <MaterialIcons name="thumb-down-alt" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.declineText}>{translate('decline')}</Text>
          </Pressable>
          <Pressable style={styles.acceptBtn}>
            <MaterialIcons name="thumb-up-alt" size={18} color={colors.onPrimary} />
            <Text style={styles.acceptText}>{translate('acceptInterest')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default function InterestsScreen() {
  const { translate, translateFormat } = useLanguage();
  const { getValue } = useProfileForm();
  const [membershipMode, setMembershipMode] = useState<'regular' | 'prime'>('regular');
  const [directionTab, setDirectionTab] = useState<DirectionTab>('received');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const userGender = getValue('gender');

  const allInterests: InterestItem[] = useMemo(() => {
    const filteredMatches = filterByRecommendedGender(images.matches, userGender);
    const [first, second, third] = filteredMatches;
    const professions = ['Banking Professional', 'Medical Specialist', 'Software Professional'];
    const salaries = [
      '₹ 12 - 14 lakhs per annum',
      '₹ 18 - 20 lakhs per annum',
      '₹ 15 - 18 lakhs per annum',
    ];
    const dates = ['14 Jun 26', '10 Jun 26', '08 Jun 26'];
    const configs: Array<{
      match: (typeof filteredMatches)[number] | undefined;
      direction: DirectionTab;
      filterStatus: StatusFilter;
      profession: string;
      salary: string;
      interestDate: string;
    }> = [
      {
        match: third,
        direction: 'received',
        filterStatus: 'pending',
        profession: professions[0],
        salary: salaries[0],
        interestDate: dates[0],
      },
      {
        match: second,
        direction: 'received',
        filterStatus: 'accepted',
        profession: professions[1],
        salary: salaries[1],
        interestDate: dates[1],
      },
      {
        match: first,
        direction: 'sent',
        filterStatus: 'pending',
        profession: professions[2],
        salary: salaries[2],
        interestDate: dates[2],
      },
    ];

    return configs
      .filter((config) => config.match)
      .map((config) => {
        const match = config.match!;
        return {
          id: match.id,
          name: match.name,
          image: match.image,
          summaryLine: formatProfileSummary(match.age, match.community),
          profession: config.profession,
          salary: config.salary,
          location: match.location,
          interestDate: config.interestDate,
          direction: config.direction,
          filterStatus: config.filterStatus,
          pronoun: match.gender === 'female' ? ('she' as const) : ('he' as const),
        };
      });
  }, [userGender]);

  const directionInterests = useMemo(
    () => allInterests.filter((item) => item.direction === directionTab),
    [allInterests, directionTab],
  );

  const filterCounts = useMemo(
    () => ({
      all: directionInterests.length,
      pending: directionInterests.filter((item) => item.filterStatus === 'pending').length,
      accepted: directionInterests.filter((item) => item.filterStatus === 'accepted').length,
      declined: directionInterests.filter((item) => item.filterStatus === 'declined').length,
    }),
    [directionInterests],
  );

  const visibleInterests = useMemo(() => {
    if (statusFilter === 'all') {
      return directionInterests;
    }
    return directionInterests.filter((item) => item.filterStatus === statusFilter);
  }, [directionInterests, statusFilter]);

  const sectionTitle = useMemo(() => {
    if (statusFilter === 'pending') {
      return translateFormat('pendingInterestsTitle', { count: filterCounts.pending });
    }
    if (statusFilter === 'accepted') {
      return translateFormat('acceptedInterestsTitle', { count: filterCounts.accepted });
    }
    if (statusFilter === 'declined') {
      return translateFormat('declinedInterestsTitle', { count: filterCounts.declined });
    }
    return translateFormat('allInterestsTitle', { count: filterCounts.all });
  }, [filterCounts, statusFilter, translateFormat]);

  const sectionSubtitle =
    directionTab === 'received' && statusFilter === 'pending'
      ? translate('pendingInterestsSubtitle')
      : directionTab === 'sent'
        ? translate('sentInterestsSubtitle')
        : translate('receivedInterestsSubtitle');

  const statusFilters: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: translate('allTab'), count: filterCounts.all },
    { key: 'pending', label: translate('pending'), count: filterCounts.pending },
    { key: 'accepted', label: translate('acceptedReplied'), count: filterCounts.accepted },
    { key: 'declined', label: translate('declined'), count: filterCounts.declined },
  ];

  const directionTabs: { key: DirectionTab; label: string; dot?: boolean }[] = [
    { key: 'received', label: translate('interestsReceived'), dot: true },
    { key: 'sent', label: translate('interestsSent') },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.topUtilityRow}>
          <View style={styles.membershipToggle}>
            <Pressable
              style={[styles.togglePill, membershipMode === 'regular' && styles.togglePillActive]}
              onPress={() => setMembershipMode('regular')}
            >
              <Text
                style={[styles.toggleText, membershipMode === 'regular' && styles.toggleTextActive]}
              >
                {translate('regular')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.togglePill, membershipMode === 'prime' && styles.togglePillActive]}
              onPress={() => setMembershipMode('prime')}
            >
              <Text style={[styles.toggleText, membershipMode === 'prime' && styles.toggleTextActive]}>
                {translate('prime')}
              </Text>
              <View style={styles.primeDot} />
            </Pressable>
          </View>
        </View>

        <View style={styles.tabsRow}>
          {directionTabs.map((tab) => {
            const isActive = directionTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={styles.tabItem}
                onPress={() => {
                  setDirectionTab(tab.key);
                  setStatusFilter(tab.key === 'received' ? 'pending' : 'all');
                }}
              >
                <View style={styles.tabLabelRow}>
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
                  {tab.dot && isActive ? <View style={styles.tabDot} /> : null}
                </View>
                {isActive ? <View style={styles.tabIndicator} /> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sectionDivider} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {statusFilters.map((chip) => {
            const isActive = statusFilter === chip.key;
            const label = `${chip.label} (${chip.count})`;

            return isActive ? (
              <Pressable key={chip.key} onPress={() => setStatusFilter(chip.key)}>
                <LinearGradient
                  colors={[colorsLocal.chipGradientStart, colorsLocal.chipGradientEnd]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.filterChipActive}
                >
                  <Text style={styles.filterChipTextActive}>{label}</Text>
                </LinearGradient>
              </Pressable>
            ) : (
              <Pressable
                key={chip.key}
                style={styles.filterChip}
                onPress={() => setStatusFilter(chip.key)}
              >
                <Text style={styles.filterChipText}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionToolsRow}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
            <Text style={styles.sectionSubtitle}>{sectionSubtitle}</Text>
          </View>
          <View style={styles.toolsRow}>
            <Pressable style={styles.filterActionBtn}>
              <MaterialIcons name="tune" size={16} color={colors.onSurface} />
              <Text style={styles.filterActionText}>{translate('filter')}</Text>
            </Pressable>
            <Pressable style={styles.searchBtn} hitSlop={8}>
              <MaterialIcons name="search" size={22} color={colors.onSurface} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {visibleInterests.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="favorite-border" size={40} color={colors.onSurfaceVariant} />
            <Text style={styles.emptyText}>{translate('noInterestsInFilter')}</Text>
          </View>
        ) : (
          visibleInterests.map((item) => <InterestCard key={item.id} item={item} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const colorsLocal = {
  tabActive: '#00897B',
  chipBorder: '#D9D9D9',
  chipGradientStart: '#00897B',
  chipGradientEnd: '#26A69A',
  cardTint: '#EEF3F8',
  ctaOrange: '#F57C00',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  header: {
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: spacing.sm,
  },
  topUtilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    marginBottom: spacing.md,
  },
  membershipToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colorsLocal.chipBorder,
  },
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  togglePillActive: {
    borderWidth: 1,
    borderColor: colorsLocal.ctaOrange,
    backgroundColor: colors.surfaceContainerLowest,
  },
  toggleText: {
    ...typography.labelSm,
    color: colors.onSurface,
    fontSize: 12,
  },
  toggleTextActive: {
    color: colorsLocal.ctaOrange,
    fontFamily: fonts.interSemi,
  },
  primeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: spacing.xs,
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
  },
  tabText: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    fontSize: 13,
    textAlign: 'center',
  },
  tabTextActive: {
    color: colorsLocal.tabActive,
    fontFamily: fonts.interSemi,
  },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colorsLocal.ctaOrange,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.sm,
    right: spacing.sm,
    height: 3,
    borderRadius: 2,
    backgroundColor: colorsLocal.tabActive,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colorsLocal.chipBorder,
    marginVertical: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colorsLocal.chipBorder,
    backgroundColor: '#FFF8F0',
  },
  filterChipActive: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
  },
  filterChipText: {
    ...typography.labelLg,
    color: colors.onSurface,
    fontSize: 13,
  },
  filterChipTextActive: {
    ...typography.labelLg,
    color: '#fff',
    fontSize: 13,
    fontFamily: fonts.interSemi,
  },
  sectionToolsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionCopy: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.titleLg,
    fontSize: 16,
    color: colors.onSurface,
    fontFamily: fonts.interSemi,
  },
  sectionSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  toolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colorsLocal.chipBorder,
    backgroundColor: colors.surfaceContainerLowest,
  },
  filterActionText: {
    ...typography.labelLg,
    color: colors.onSurface,
    fontSize: 13,
  },
  searchBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listScroll: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
  },
  listContent: {
    padding: spacing.containerMargin,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  interestCard: {
    backgroundColor: colorsLocal.cardTint,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#D6E4F0',
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardAvatar: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceContainerHigh,
  },
  cardInfo: {
    flex: 1,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  namePressable: {
    flex: 1,
  },
  cardName: {
    ...typography.titleLg,
    fontSize: 16,
    color: colors.onSurface,
    fontFamily: fonts.interSemi,
  },
  cardMenuBtn: {
    padding: 2,
  },
  summaryLine: {
    ...typography.bodyMd,
    color: colors.onSurface,
    marginTop: 4,
    fontSize: 13,
  },
  detailLine: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    marginTop: 2,
    fontSize: 13,
  },
  statusBlock: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colorsLocal.chipBorder,
  },
  statusTitle: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontFamily: fonts.interSemi,
    fontSize: 14,
  },
  statusHint: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    marginTop: 4,
    fontSize: 13,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colorsLocal.chipBorder,
    backgroundColor: colors.surfaceContainerLowest,
  },
  declineText: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    fontSize: 13,
  },
  acceptBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colorsLocal.ctaOrange,
  },
  acceptText: {
    ...typography.labelLg,
    color: colors.onPrimary,
    fontSize: 13,
    fontFamily: fonts.interSemi,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
