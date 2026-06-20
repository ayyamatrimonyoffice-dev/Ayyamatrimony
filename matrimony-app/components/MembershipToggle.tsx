import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { borderRadius, colors, fonts, spacing, typography } from '@/constants/theme';

type MembershipToggleProps = {
  variant?: 'filled' | 'outlined';
};

export function MembershipToggle({ variant = 'filled' }: MembershipToggleProps) {
  const router = useRouter();
  const { translate } = useLanguage();
  const { membershipViewMode, setMembershipViewMode, isPaidMember } = useSubscription();
  const isFilled = variant === 'filled';
  const pillPadding = isFilled ? spacing.sm : spacing.md;

  const handleRegularPress = () => {
    setMembershipViewMode('regular');
  };

  const handlePrimePress = () => {
    if (!isPaidMember) {
      router.push('/upgrade');
      return;
    }
    setMembershipViewMode('prime');
  };

  return (
    <View style={[styles.toggle, isFilled ? styles.toggleFilled : styles.toggleOutlined]}>
      <Pressable
        style={[
          styles.pill,
          { paddingHorizontal: pillPadding },
          membershipViewMode === 'regular' &&
            (isFilled ? styles.pillActiveFilled : styles.pillActiveOutlined),
        ]}
        onPress={handleRegularPress}
      >
        <Text
          style={[
            styles.text,
            isFilled ? styles.textFilled : styles.textOutlined,
            membershipViewMode === 'regular' &&
              (isFilled ? styles.textActiveFilled : styles.textActiveOutlined),
          ]}
        >
          {translate('regular')}
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.pill,
          { paddingHorizontal: pillPadding },
          membershipViewMode === 'prime' &&
            (isFilled ? styles.pillActiveFilled : styles.pillActiveOutlined),
        ]}
        onPress={handlePrimePress}
      >
        <Text
          style={[
            styles.text,
            isFilled ? styles.textFilled : styles.textOutlined,
            membershipViewMode === 'prime' &&
              (isFilled ? styles.textActiveFilled : styles.textActiveOutlined),
          ]}
        >
          {translate('prime')}
        </Text>
        <View style={styles.primeDot} />
      </Pressable>
    </View>
  );
}

const colorsLocal = {
  chipBorder: '#D9D9D9',
  ctaOrange: '#F57C00',
};

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    padding: 3,
  },
  toggleFilled: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primaryContainer,
  },
  toggleOutlined: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colorsLocal.chipBorder,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  pillActiveFilled: {
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  pillActiveOutlined: {
    borderWidth: 1,
    borderColor: colorsLocal.ctaOrange,
    backgroundColor: colors.surfaceContainerLowest,
  },
  text: {
    ...typography.labelSm,
    fontSize: 11,
  },
  textFilled: {
    color: 'rgba(255,255,255,0.88)',
  },
  textOutlined: {
    color: colors.onSurface,
    fontSize: 12,
  },
  textActiveFilled: {
    color: colors.primary,
  },
  textActiveOutlined: {
    color: colorsLocal.ctaOrange,
    fontFamily: fonts.interSemi,
    fontSize: 12,
  },
  primeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
  },
});
