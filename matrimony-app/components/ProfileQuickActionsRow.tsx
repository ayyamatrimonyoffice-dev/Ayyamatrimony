import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { colors, spacing, typography } from '@/constants/theme';

export function ProfileQuickActionsRow() {
  const router = useRouter();
  const { translate } = useLanguage();

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
    {
      key: 'add-profile',
      label: translate('addProfile'),
      icon: 'person-add' as const,
      tint: '#E8F5E9',
      accent: '#2E7D32',
      route: '/add-profile' as Href,
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
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push(action.route)}
        >
          <View style={[styles.iconWrap, { backgroundColor: action.tint }]}>
            <MaterialIcons name={action.icon} size={24} color={action.accent} />
          </View>
          <Text style={styles.label}>{action.label}</Text>
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
    width: 108,
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
  },
});
