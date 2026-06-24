import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { colors, spacing, typography } from '@/constants/theme';

export function ProfileQuickActionsRow() {
  const router = useRouter();
  const { translate, language } = useLanguage();
  const isTamil = language === 'ta';

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
    <View style={styles.row}>
      {actions.map((action) => (
        <Pressable
          key={action.key}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push(action.route)}
        >
          <View style={[styles.iconWrap, { backgroundColor: action.tint }]}>
            <MaterialIcons name={action.icon} size={24} color={action.accent} />
          </View>
          <Text
            style={[styles.label, isTamil && styles.labelTamil]}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
          >
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: spacing.md,
  },
  card: {
    width: 84,
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
    width: '100%',
    minHeight: 28,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  labelTamil: {
    fontSize: 11,
    lineHeight: 15,
    minHeight: 32,
  },
});
