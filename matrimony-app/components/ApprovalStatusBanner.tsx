import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { useUserApproval } from '@/context/UserApprovalContext';
import { colors, spacing, typography } from '@/constants/theme';
import { premiumCard } from '@/constants/premiumUi';

export function ApprovalStatusBanner() {
  const { translate, language } = useLanguage();
  const { approvalStatus, canBrowseProfiles } = useUserApproval();

  if (canBrowseProfiles) {
    return null;
  }

  const isRejected = approvalStatus === 'rejected';

  return (
    <View style={[styles.banner, isRejected ? styles.bannerRejected : styles.bannerPending]}>
      <MaterialIcons
        name={isRejected ? 'block' : 'hourglass-top'}
        size={22}
        color={isRejected ? colors.error : colors.primary}
      />
      <View style={styles.textWrap}>
        <Text style={[styles.title, language === 'ta' && styles.titleTamil]} numberOfLines={2}>
          {translate(isRejected ? 'approvalRejectedTitle' : 'approvalPendingTitle')}
        </Text>
        <Text style={[styles.message, language === 'ta' && styles.messageTamil]}>
          {translate(isRejected ? 'approvalRejectedMessage' : 'approvalPendingMessage')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: premiumCard.radius,
    borderWidth: 1,
    ...premiumCard.shadow,
  },
  bannerPending: {
    backgroundColor: '#FFF8F0',
    borderColor: 'rgba(87, 0, 0, 0.12)',
  },
  bannerRejected: {
    backgroundColor: '#FFF3F3',
    borderColor: 'rgba(198, 40, 40, 0.18)',
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...typography.titleLg,
    color: colors.onSurface,
  },
  titleTamil: {
    fontSize: 15,
    lineHeight: 20,
  },
  message: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  messageTamil: {
    fontSize: 13,
    lineHeight: 19,
  },
});
