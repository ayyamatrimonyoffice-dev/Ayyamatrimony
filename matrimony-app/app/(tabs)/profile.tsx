import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKey } from '@/constants/i18n';
import { colors, spacing, typography } from '@/constants/theme';
import { images } from '@/constants/images';

type MenuItem = {
  labelKey: TranslationKey;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: Href;
};

const menuItems: MenuItem[] = [
  { labelKey: 'editProfile', icon: 'edit', route: '/edit-profile' },
  { labelKey: 'partnerPreferences', icon: 'favorite-border', route: '/partner-preferences' },
  { labelKey: 'privacySettings', icon: 'lock-outline', route: '/privacy-settings' },
  { labelKey: 'settings', icon: 'settings', route: '/settings' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { translate, translateFormat } = useLanguage();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader title={translate('profile')} showBack={false} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Image source={{ uri: images.logo }} style={styles.avatar} />
          <Text style={styles.name}>Ananya Krishnan</Text>
          <Text style={styles.meta}>Chennai, Tamil Nadu • Iyer</Text>
          <View style={styles.progressWrap}>
            <ProgressBar progress={85} label={translateFormat('percentComplete', { percent: 85 })} />
          </View>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item) => (
            <Pressable
              key={item.labelKey}
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={() => router.push(item.route)}
            >
              <MaterialIcons name={item.icon} size={22} color={colors.primary} />
              <Text style={styles.menuLabel}>{translate(item.labelKey)}</Text>
              <MaterialIcons name="chevron-right" size={22} color={colors.onSurfaceVariant} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingTop: 72,
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginBottom: spacing.md,
  },
  name: {
    ...typography.headlineLg,
    color: colors.primary,
  },
  meta: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  progressWrap: {
    width: '100%',
    maxWidth: 320,
  },
  menu: {
    paddingHorizontal: spacing.containerMargin,
    gap: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 191, 185, 0.2)',
    gap: spacing.md,
  },
  menuItemPressed: {
    backgroundColor: colors.surfaceContainerLow,
    opacity: 0.9,
  },
  menuLabel: {
    ...typography.labelLg,
    color: colors.onSurface,
    flex: 1,
  },
});
