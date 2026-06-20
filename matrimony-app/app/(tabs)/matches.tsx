import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MatchCard } from '@/components/MatchCard';
import { ApprovalStatusBanner } from '@/components/ApprovalStatusBanner';
import { getMemberBiodataValues, type PublishedMember } from '@/constants/memberDirectory';
import { resolveUserGender } from '@/constants/matchFilters';
import { useLanguage } from '@/context/LanguageContext';
import { useProfileForm } from '@/context/ProfileFormContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useUserApproval } from '@/context/UserApprovalContext';
import { useBrowsableMembers } from '@/hooks/useBrowsableMembers';
import { useMemberDirectory } from '@/hooks/useMemberDirectory';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';

function getMatchOccupation(id: string, published: PublishedMember[]): string {
  const biodata = getMemberBiodataValues(id, published);
  return biodata?.occupationDesignation?.trim() || biodata?.occupation?.trim() || '—';
}

function formatMatchCommunity(
  community: string,
  id: string,
  published: PublishedMember[],
): string {
  const biodata = getMemberBiodataValues(id, published);
  const subCaste = community.split(',')[0]?.trim();
  const caste = biodata?.caste?.trim();
  if (caste && subCaste) {
    return `${caste} - ${subCaste}`;
  }
  return community.replace(',', ' -').trim();
}

export default function MatchesScreen() {
  const { translate } = useLanguage();
  const { values } = useProfileForm();
  const { isPaidMember, profilesAllowed } = useSubscription();
  const { published, isReady } = useMemberDirectory();
  const { canBrowseProfiles, approvalStatus } = useUserApproval();
  const browsableMembers = useBrowsableMembers();
  const userGender = resolveUserGender(values);

  const matches = useMemo(() => {
    if (!isPaidMember) {
      return browsableMembers;
    }
    return browsableMembers.slice(0, profilesAllowed);
  }, [browsableMembers, isPaidMember, profilesAllowed]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.heroSection}>
          <Text style={styles.headerTitle}>{translate('matches')}</Text>

          <ApprovalStatusBanner />
        </View>

        <View style={styles.listContent}>
          {!isReady ? null : matches.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {!canBrowseProfiles && approvalStatus
                  ? translate(approvalStatus === 'rejected' ? 'approvalRejectedMessage' : 'approvalPendingMessage')
                  : !userGender
                    ? translate('setGenderToSeeMatches')
                    : translate('noMatchesYet')}
              </Text>
            </View>
          ) : (
            matches.map((match) => (
              <MatchCard
                key={match.id}
                id={match.id}
                name={match.name}
                age={match.age}
                community={formatMatchCommunity(match.community, match.id, published)}
                location={match.location}
                image={match.image}
                occupation={getMatchOccupation(match.id, published)}
                verified={match.verified ?? true}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  heroSection: {
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    gap: spacing.md,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    ...typography.headlineMd,
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.md,
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
