import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { colors, spacing, typography } from '@/constants/theme';

export function ProfileQuickActionsRow() {
  const router = useRouter();
  const { translate, language } = useLanguage();
  const { quickActionCardWidth } = useResponsiveLayout();
  const isTamil = language === 'ta';
  const cardWidth = Math.max(quickActionCardWidth, isTamil ? 112 : 100);

  const actions = [
    {
      key: 'photos',
      label: translate('addPhotos'),
      icon: 'add-a-photo' as const,
      tint: '#FCEAE8',
      accent: colors.primary,
      route: '/add-photos' as Href,
    },
    {
      key: 'view-profile',
      label: translate('viewProfile'),
      icon: 'visibility' as const,
      tint: '#E8F4FD',
      accent: '#1565C0',
      route: '/view-profile' as Href,
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {actions.map((action) => (
        <Pressable
          key={action.key}
          style={({ pressed }) => [styles.card, { width: cardWidth }, pressed && styles.cardPressed]}
          onPress={() => router.push(action.route)}
        >
          <View style={[styles.iconWrap, { backgroundColor: action.tint }]}>
            <MaterialIcons name={action.icon} size={24} color={action.accent} />
          </View>
          <Text
            style={[styles.label, isTamil && styles.labelTamil]}
            numberOfLines={3}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {action.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingRight: spacing.containerMargin,
  },
  card: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardPressed: {
    opacity: 0.88,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.labelSm,
    color: colors.onSurface,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
    minHeight: 28,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  labelTamil: {
    fontSize: 10,
    lineHeight: 13,
    minHeight: 36,
  },
});
