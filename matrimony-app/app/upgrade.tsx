import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKey } from '@/constants/i18n';
import { borderRadius, colors, fonts, spacing, typography } from '@/constants/theme';

type PackTab = 'regular' | 'dual';

type PlanOption = {
  id: string;
  labelKey: TranslationKey;
  badgeKey?: TranslationKey;
  nameKey: TranslationKey;
  originalPrice: number;
  price: number;
  discount: number;
  months: number;
  monthly: number;
  featureKeys: TranslationKey[];
  mutedFeatureKeys?: TranslationKey[];
};

const REGULAR_PLANS: PlanOption[] = [
  {
    id: 'gold-3',
    labelKey: 'planGold3Months',
    nameKey: 'planGold',
    originalPrice: 5500,
    price: 3100,
    discount: 44,
    months: 3,
    monthly: 1033,
    featureKeys: [
      'featureValidMonths',
      'featurePhoneNos',
      'featureUnlimitedMessages',
      'featureHoroscope',
    ],
    mutedFeatureKeys: ['featureVerifiedPhotos'],
  },
  {
    id: 'prime-gold-3',
    labelKey: 'planPrimeGold3Months',
    nameKey: 'planPrimeGold',
    originalPrice: 7500,
    price: 4200,
    discount: 44,
    months: 3,
    monthly: 1400,
    featureKeys: [
      'featureValidMonths',
      'featurePhoneNos',
      'featureUnlimitedMessages',
      'featureHoroscope',
      'featureVerifiedPhotos',
    ],
  },
  {
    id: 'till-u-marry',
    labelKey: 'planTillUMarry',
    badgeKey: 'bestValue',
    nameKey: 'planTillUMarryName',
    originalPrice: 12000,
    price: 4300,
    discount: 64,
    months: 12,
    monthly: 358,
    featureKeys: [
      'featureValidMonths',
      'featurePhoneNos',
      'featureUnlimitedMessages',
      'featureHoroscope',
      'featureVerifiedPhotos',
    ],
  },
];

const DUAL_PLANS: PlanOption[] = [
  {
    id: 'dual-gold',
    labelKey: 'planDualGold',
    nameKey: 'planDualGoldName',
    originalPrice: 6800,
    price: 3900,
    discount: 43,
    months: 3,
    monthly: 1300,
    featureKeys: [
      'featureValidMonths',
      'featurePhoneNos',
      'featureUnlimitedMessages',
      'featureHoroscope',
      'featureVerifiedPhotos',
    ],
  },
];

function formatRupee(amount: number) {
  return `₹ ${amount.toLocaleString('en-IN')}`;
}

export default function UpgradeScreen() {
  const { translate, translateFormat } = useLanguage();
  const [packTab, setPackTab] = useState<PackTab>('regular');
  const [selectedPlanId, setSelectedPlanId] = useState(REGULAR_PLANS[0].id);

  const plans = packTab === 'regular' ? REGULAR_PLANS : DUAL_PLANS;

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0],
    [plans, selectedPlanId],
  );

  const handlePackTabChange = (tab: PackTab) => {
    setPackTab(tab);
    const nextPlans = tab === 'regular' ? REGULAR_PLANS : DUAL_PLANS;
    setSelectedPlanId(nextPlans[0].id);
  };

  const handlePayNow = () => {
    Alert.alert(translate('payNow'), translate('paymentComingSoon'), [
      { text: translate('ok') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader title={translate('upgradeTitle')} showBack showTamil={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <LinearGradient
          colors={['#FFF4D6', '#FFE8EC', '#FFF8F6']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.promoBanner}
        >
          <Text style={styles.promoSave}>{translate('saveUpto66')}</Text>
          <Text style={styles.promoPlus}>+</Text>
          <Text style={styles.promoGuarantee}>{translate('moneyBackGuarantee')}</Text>
        </LinearGradient>

        <View style={styles.packTabs}>
          <Pressable style={styles.packTabItem} onPress={() => handlePackTabChange('regular')}>
            <Text style={[styles.packTabText, packTab === 'regular' && styles.packTabTextActive]}>
              {translate('regularPacks')}
            </Text>
            {packTab === 'regular' ? <View style={styles.packTabIndicator} /> : null}
          </Pressable>
          <Pressable style={styles.packTabItem} onPress={() => handlePackTabChange('dual')}>
            <Text style={[styles.packTabText, packTab === 'dual' && styles.packTabTextActive]}>
              {translate('dualPacks')}
            </Text>
            {packTab === 'dual' ? <View style={styles.packTabIndicator} /> : null}
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.planPillsRow}
        >
          {plans.map((plan) => {
            const isSelected = plan.id === selectedPlan.id;
            return (
              <View key={plan.id} style={styles.planPillWrap}>
                {plan.badgeKey ? (
                  <View style={styles.bestValueBadge}>
                    <Text style={styles.bestValueText}>{translate(plan.badgeKey)}</Text>
                  </View>
                ) : null}
                <Pressable
                  style={[
                    styles.planPill,
                    isSelected && styles.planPillSelected,
                    plan.badgeKey && !isSelected && styles.planPillHighlighted,
                  ]}
                  onPress={() => setSelectedPlanId(plan.id)}
                >
                  <Text
                    style={[
                      styles.planPillText,
                      isSelected && styles.planPillTextSelected,
                    ]}
                  >
                    {translate(plan.labelKey)}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.planCard}>
          <Text style={styles.planName}>{translate(selectedPlan.nameKey)}</Text>
          <Text style={styles.discountLine}>
            {translateFormat('discountValidToday', { percent: selectedPlan.discount })}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.originalPrice}>{formatRupee(selectedPlan.originalPrice)}</Text>
            <Text style={styles.currentPrice}>{formatRupee(selectedPlan.price)}</Text>
          </View>

          <View style={styles.monthlyPill}>
            <Text style={styles.monthlyText}>
              {translateFormat('perMonth', { amount: selectedPlan.monthly.toLocaleString('en-IN') })}
            </Text>
          </View>

          <View style={styles.featuresList}>
            {selectedPlan.featureKeys.map((featureKey) => (
              <View key={featureKey} style={styles.featureRow}>
                <MaterialIcons name="check-circle" size={18} color={colorsLocal.accentTeal} />
                <Text style={styles.featureText}>
                  {featureKey === 'featureValidMonths'
                    ? translateFormat(featureKey, { months: selectedPlan.months })
                    : translate(featureKey)}
                </Text>
              </View>
            ))}
            {selectedPlan.mutedFeatureKeys?.map((featureKey) => (
              <View key={featureKey} style={styles.featureRow}>
                <MaterialIcons name="check-circle" size={18} color={colors.outlineVariant} />
                <Text style={styles.featureTextMuted}>{translate(featureKey)}</Text>
              </View>
            ))}
          </View>

          <Pressable style={styles.payNowBtn} onPress={handlePayNow}>
            <Text style={styles.payNowText}>{translate('payNow')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const colorsLocal = {
  accentTeal: '#00897B',
  payNow: '#F57C00',
  chipBorder: '#D9D9D9',
  dualTab: '#3949AB',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.md,
  },
  promoSave: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontSize: 18,
  },
  promoPlus: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontSize: 18,
  },
  promoGuarantee: {
    ...typography.titleLg,
    color: colors.primary,
    fontSize: 16,
    fontFamily: fonts.interSemi,
    textAlign: 'center',
  },
  packTabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colorsLocal.chipBorder,
    paddingHorizontal: spacing.containerMargin,
  },
  packTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  packTabText: {
    ...typography.labelLg,
    color: colorsLocal.dualTab,
    textAlign: 'center',
    fontSize: 13,
  },
  packTabTextActive: {
    color: colorsLocal.accentTeal,
    fontFamily: fonts.interSemi,
  },
  packTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.sm,
    right: spacing.sm,
    height: 3,
    borderRadius: 2,
    backgroundColor: colorsLocal.accentTeal,
  },
  planPillsRow: {
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  planPillWrap: {
    position: 'relative',
    paddingTop: 10,
  },
  bestValueBadge: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    zIndex: 1,
    backgroundColor: '#7B1FA2',
    borderRadius: borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  bestValueText: {
    ...typography.labelSm,
    color: '#fff',
    fontSize: 9,
  },
  planPill: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colorsLocal.chipBorder,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  planPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  planPillHighlighted: {
    borderColor: '#7B1FA2',
  },
  planPillText: {
    ...typography.labelLg,
    color: colors.onSurface,
    textAlign: 'center',
    fontSize: 13,
  },
  planPillTextSelected: {
    color: colors.onPrimary,
  },
  planCard: {
    marginHorizontal: spacing.containerMargin,
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colorsLocal.chipBorder,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  planName: {
    ...typography.headlineMd,
    fontSize: 22,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  discountLine: {
    ...typography.labelLg,
    color: colorsLocal.accentTeal,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  originalPrice: {
    ...typography.titleLg,
    color: colors.onSurfaceVariant,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: fonts.interSemi,
    color: colors.onSurface,
  },
  monthlyPill: {
    alignSelf: 'center',
    backgroundColor: '#FCE4EC',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginBottom: spacing.lg,
  },
  monthlyText: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
  },
  featuresList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
  featureTextMuted: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  payNowBtn: {
    backgroundColor: colorsLocal.payNow,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  payNowText: {
    ...typography.titleLg,
    color: '#fff',
    fontSize: 18,
  },
});
