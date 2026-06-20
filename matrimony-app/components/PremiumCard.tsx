import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ProtectedProfileImage } from '@/components/ProtectedProfileImage';
import { useLanguage } from '@/context/LanguageContext';
import { colors, spacing, typography } from '@/constants/theme';

type PremiumCardProps = {
  name: string;
  role: string;
  image: string;
  premium?: boolean;
  locked?: boolean;
};

export function PremiumCard({ name, role, image, premium, locked = false }: PremiumCardProps) {
  const { translate } = useLanguage();

  return (
    <View style={styles.card}>
      <ProtectedProfileImage imageUri={image} locked={locked} style={styles.imageWrap} imageStyle={styles.image} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.gradient} />
      {premium ? (
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>{translate('premium')}</Text>
        </View>
      ) : null}
      <View style={styles.footer}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.role}>{locked ? translate('detailsLocked') : role}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 266,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    marginRight: spacing.md,
  },
  imageWrap: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  premiumBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(115, 92, 0, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.onSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  name: {
    ...typography.headlineMd,
    fontSize: 18,
    color: '#fff',
  },
  role: {
    ...typography.labelSm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
