import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';

export function PendingPaymentBanner() {
  const { translate } = useLanguage();
  const { pendingPayment, isPaidMember } = useSubscription();

  if (!pendingPayment || isPaidMember) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <MaterialIcons name="payments" size={22} color={colors.primary} />
      <View style={styles.textWrap}>
        <Text style={styles.title}>{translate('paymentPendingReviewTitle')}</Text>
        <Text style={styles.message}>{translate('paymentPendingReviewMessage')}</Text>
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
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    backgroundColor: '#F3F8FF',
    borderColor: 'rgba(87, 0, 0, 0.12)',
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...typography.titleLg,
    color: colors.onSurface,
  },
  message: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
});
