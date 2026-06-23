import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKey } from '@/constants/i18n';
import { borderRadius, colors, fonts, spacing, typography } from '@/constants/theme';

const BENEFIT_KEYS: TranslationKey[] = [
  'primeBannerBenefitViews',
  'primeBannerBenefitInterests',
  'primeBannerBenefitMatching',
];

export function UpgradePrimeBanner() {
  const router = useRouter();
  const { translate, language } = useLanguage();
  const isTamil = language === 'ta';

  const goUpgrade = () => router.push('/upgrade');

  return (
    <Pressable
      onPress={goUpgrade}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={['#800000', colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.banner, isTamil && styles.bannerTamil]}
      >
        <View style={styles.decorPattern} pointerEvents="none">
          {Array.from({ length: 16 }, (_, index) => (
            <View
              key={index}
              style={[
                styles.decorDot,
                {
                  top: 8 + (index % 4) * 14,
                  right: 6 + Math.floor(index / 4) * 10,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.crownCircle}>
          <MaterialIcons name="workspace-premium" size={22} color={colors.gold} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            {translate('upgradeToPrimePrefix')}
            <Text style={styles.titlePrime}>{translate('primeBannerHighlight')}</Text>
          </Text>
          {BENEFIT_KEYS.map((key) => (
            <View key={key} style={styles.benefitRow}>
              <MaterialIcons name="check" size={12} color="#fff" />
              <Text style={[styles.benefitText, isTamil && styles.benefitTextTamil]} numberOfLines={2}>
                {translate(key)}
              </Text>
            </View>
          ))}
        </View>

        <Pressable onPress={goUpgrade} style={[styles.ctaPressable, isTamil && styles.ctaPressableTamil]}>
          <LinearGradient
            colors={['#FFE088', '#D4AF37']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaButton}
          >
            <Text style={[styles.ctaText, isTamil && styles.ctaTextTamil]} numberOfLines={1}>
              {translate('upgradeNow')}
            </Text>
            <MaterialIcons name="chevron-right" size={16} color={colors.primary} />
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  pressed: {
    opacity: 0.96,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
    overflow: 'hidden',
    minHeight: 88,
  },
  bannerTamil: {
    minHeight: 96,
    paddingVertical: spacing.sm,
  },
  decorPattern: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
  },
  decorDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 184, 77, 0.35)',
  },
  crownCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.gold,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    ...typography.labelLg,
    color: colors.onPrimary,
    fontFamily: fonts.interSemi,
    fontSize: 14,
    lineHeight: 18,
  },
  titlePrime: {
    color: colors.secondaryFixed,
    fontFamily: fonts.interSemi,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  benefitText: {
    ...typography.bodyMd,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
    flexShrink: 1,
  },
  benefitTextTamil: {
    fontSize: 9,
    lineHeight: 12,
  },
  ctaPressable: {
    flexShrink: 0,
    alignSelf: 'center',
  },
  ctaPressableTamil: {
    maxWidth: 96,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
  },
  ctaText: {
    ...typography.labelSm,
    color: colors.primary,
    fontFamily: fonts.interSemi,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  ctaTextTamil: {
    fontSize: 10,
    letterSpacing: 0,
  },
});
