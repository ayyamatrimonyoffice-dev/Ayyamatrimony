import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { CreateProfileBiodataForm } from '@/components/CreateProfileBiodataForm';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProtectedProfileImage } from '@/components/ProtectedProfileImage';
import { useBrowsableMembers } from '@/hooks/useBrowsableMembers';
import { getMemberBiodataValues, resolveMemberListing } from '@/constants/memberDirectory';
import { colors, spacing, typography } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useMemberDirectory } from '@/context/MemberDirectoryContext';
import { useMemberAccess } from '@/hooks/useMemberAccess';

export default function MemberProfileScreen() {
  const router = useRouter();
  const { translate } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { published, isReady: directoryReady } = useMemberDirectory();
  const browsableMembers = useBrowsableMembers();
  const {
    isReady,
    profilesRemaining,
    recordProfileView,
    pendingPayment,
  } = useSubscription();
  const { canViewFullProfile, isProfileApproved, hasVerifiedPayment } = useMemberAccess();

  const profileId = id ?? '';
  const member = resolveMemberListing(profileId, published);
  const canBrowseMember = useMemo(
    () => browsableMembers.some((entry) => entry.id === profileId),
    [browsableMembers, profileId],
  );
  const biodataValues = useMemo(
    () => getMemberBiodataValues(profileId, published),
    [profileId, published],
  );
  const showFullProfile = isReady && canViewFullProfile(profileId);

  useEffect(() => {
    if (!isReady || !member || !profileId || !showFullProfile) {
      return;
    }

    void recordProfileView(profileId);
  }, [isReady, member, profileId, recordProfileView, showFullProfile]);

  if (!directoryReady || !isReady) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader showBack onBack={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (!member || !canBrowseMember) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader showBack onBack={() => router.back()} />
        <Text style={styles.error}>{translate('profileNotFound')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <AppHeader showBack onBack={() => router.back()} showTamil={false} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        nestedScrollEnabled
      >
        <View style={styles.photoSection}>
          <ProtectedProfileImage
            imageUri={member.image}
            locked={!showFullProfile}
            style={styles.imageWrap}
            imageStyle={styles.image}
          />
          <View style={styles.nameRow}>
            <Text style={styles.name}>{member.name}</Text>
            {member.verified && showFullProfile ? (
              <MaterialIcons name="verified" size={20} color={colors.secondary} />
            ) : null}
          </View>
        </View>

        {showFullProfile && biodataValues ? (
          <View style={styles.biodataWrap}>
            <CreateProfileBiodataForm
              editable={false}
              viewOnly
              hideActionBar
              profileValues={biodataValues}
              onSave={() => undefined}
            />
          </View>
        ) : (
          <View style={styles.lockedCard}>
            <MaterialIcons name="lock" size={28} color={colors.primary} />
            <Text style={styles.lockedTitle}>{translate('detailsLocked')}</Text>
            <View style={styles.previewRows}>
              <Text style={styles.previewText}>{member.age}</Text>
              <Text style={styles.previewText}>{member.community}</Text>
            </View>
            <Text style={styles.lockedBody}>
              {!isProfileApproved
                ? translate('approvalPendingMessage')
                : pendingPayment
                  ? translate('paymentPendingReviewMessage')
                  : !hasVerifiedPayment
                    ? translate('unpaidAccessNote')
                    : profilesRemaining <= 0
                      ? translate('profileLimitReached')
                      : translate('detailsLocked')}
            </Text>
            {!pendingPayment && !hasVerifiedPayment ? (
              <PrimaryButton
                label={translate('payRupee2000')}
                onPress={() =>
                  router.push({
                    pathname: '/payment-access',
                    params: { reason: profilesRemaining <= 0 && hasVerifiedPayment ? 'batch' : 'initial' },
                  })
                }
              />
            ) : null}
            {!hasVerifiedPayment && !pendingPayment ? (
              <Pressable style={styles.backHint} onPress={() => router.back()}>
                <Text style={styles.backHintText}>{translate('cancel')}</Text>
              </Pressable>
            ) : null}
          </View>
        )}
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
    paddingBottom: spacing.xl,
  },
  photoSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  imageWrap: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 0.82,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerHigh,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    ...typography.headlineMd,
    color: colors.primary,
  },
  biodataWrap: {
    width: '100%',
    overflow: 'visible',
  },
  lockedCard: {
    marginHorizontal: spacing.containerMargin,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  lockedTitle: {
    ...typography.headlineMd,
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
  },
  lockedBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  previewRows: {
    alignItems: 'center',
    gap: 4,
  },
  previewText: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  backHint: {
    paddingTop: spacing.xs,
  },
  backHintText: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
  },
  error: {
    ...typography.bodyMd,
    color: colors.error,
    textAlign: 'center',
    marginTop: 100,
  },
});
