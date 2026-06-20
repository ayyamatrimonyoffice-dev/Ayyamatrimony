import { useCallback } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { PaymentMethodModal } from '@/components/PaymentMethodModal';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useLanguage } from '@/context/LanguageContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { usePaymentCheckout } from '@/hooks/usePaymentCheckout';
import { borderRadius, colors, fonts, spacing, typography } from '@/constants/theme';

export default function UpgradeScreen() {
  const router = useRouter();
  const { translate, translateFormat } = useLanguage();
  const {
    accessPrice,
    batchSize,
    isPaidMember,
    profilesViewedCount,
    profilesAllowed,
    batchesPaid,
  } = useSubscription();
  const {
    paymentModalVisible,
    openPaymentMethods,
    closePaymentMethods,
    handlePaymentMethodSelect,
    accessPrice: checkoutPrice,
  } = usePaymentCheckout(() => {
    router.replace('/(tabs)');
  });

  const handleBack = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBack();
        return true;
      });
      return () => subscription.remove();
    }, [handleBack]),
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title={translate('upgradeTitle')}
        showBack
        showTamil={false}
        onBack={handleBack}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.planCard}>
          <Text style={styles.planName}>{translate('profileAccessPlan')}</Text>
          <Text style={styles.priceValue}>₹ {accessPrice.toLocaleString('en-IN')}</Text>
          <Text style={styles.priceMeta}>
            {translateFormat('profileAccessPlanMeta', { count: batchSize })}
          </Text>

          <View style={styles.infoBox}>
            <MaterialIcons name="info-outline" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              {translateFormat('upgradeProfilesOnlyNote', {
                amount: accessPrice,
                count: batchSize,
              })}
            </Text>
          </View>

          <View style={styles.featuresList}>
            {(
              [
                'paymentFeatureViewProfiles',
                'paymentFeaturePhotosDetails',
                'paymentFeatureContactInfo',
              ] as const
            ).map((key) => (
              <View key={key} style={styles.featureRow}>
                <MaterialIcons name="check-circle" size={18} color="#00897B" />
                <Text style={styles.featureText}>{translate(key)}</Text>
              </View>
            ))}
          </View>

          {isPaidMember ? (
            <Text style={styles.usageText}>
              {translateFormat('viewsUsedFormat', {
                used: profilesViewedCount,
                total: profilesAllowed,
              })}
            </Text>
          ) : null}

          <PrimaryButton label={translate('payNow')} onPress={openPaymentMethods} />

          {batchesPaid > 0 ? (
            <Text style={styles.batchNote}>
              {translateFormat('batchesPaidFormat', { count: batchesPaid })}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <PaymentMethodModal
        visible={paymentModalVisible}
        amount={checkoutPrice}
        onClose={closePaymentMethods}
        onSelect={handlePaymentMethodSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  planCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D9D9D9',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    gap: spacing.md,
  },
  planName: {
    ...typography.headlineMd,
    fontSize: 22,
    color: colors.onSurface,
    textAlign: 'center',
  },
  priceValue: {
    fontSize: 34,
    lineHeight: 40,
    color: colors.primary,
    fontFamily: fonts.playfairSemi,
    textAlign: 'center',
  },
  priceMeta: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: 'rgba(87, 0, 0, 0.06)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  infoText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
    lineHeight: 22,
  },
  featuresList: {
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  featureText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
  },
  usageText: {
    ...typography.labelLg,
    color: colors.primary,
    textAlign: 'center',
    fontFamily: fonts.interSemi,
  },
  batchNote: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
