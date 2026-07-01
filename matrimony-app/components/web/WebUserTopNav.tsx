import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LanguageLogoToggle } from '@/components/LanguageLogoToggle';
import { useLanguage } from '@/context/LanguageContext';
import { images } from '@/constants/images';
import { colors, fonts, spacing } from '@/constants/theme';
import { WEB_CONTENT_MAX_WIDTH } from '@/constants/webLayout';

type NavItem = {
  key: string;
  href: string;
  labelKey: 'homeTab' | 'matchesTab' | 'interestsTab' | 'chatTab' | 'profileTab';
  icon: keyof typeof MaterialIcons.glyphMap;
  isActive: (pathname: string) => boolean;
};

function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, '') || '/';
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'home',
    href: '/(tabs)',
    labelKey: 'homeTab',
    icon: 'home',
    isActive: (pathname) => {
      const path = normalizePath(pathname);
      return path === '/' || path === '/index' || path.endsWith('/(tabs)') || path.endsWith('/(tabs)/index');
    },
  },
  {
    key: 'matches',
    href: '/(tabs)/matches',
    labelKey: 'matchesTab',
    icon: 'favorite',
    isActive: (pathname) => {
      const path = normalizePath(pathname);
      return path.includes('/matches') || path.startsWith('/member/');
    },
  },
  {
    key: 'interests',
    href: '/(tabs)/interests',
    labelKey: 'interestsTab',
    icon: 'star',
    isActive: (pathname) => normalizePath(pathname).includes('/interests'),
  },
  {
    key: 'chat',
    href: '/(tabs)/chat',
    labelKey: 'chatTab',
    icon: 'chat',
    isActive: (pathname) => {
      const path = normalizePath(pathname);
      return path.includes('/chat') || path.startsWith('/conversation/');
    },
  },
  {
    key: 'profile',
    href: '/(tabs)/profile',
    labelKey: 'profileTab',
    icon: 'person',
    isActive: (pathname) => {
      const path = normalizePath(pathname);
      return (
        path.endsWith('/profile') ||
        path.startsWith('/edit-profile') ||
        path.startsWith('/view-profile') ||
        path.startsWith('/partner-preferences') ||
        path.startsWith('/privacy-settings') ||
        path.startsWith('/settings') ||
        path.startsWith('/add-photos') ||
        path.startsWith('/notifications')
      );
    },
  },
];

export function WebUserTopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { translate } = useLanguage();

  return (
    <View style={styles.bar}>
      <View style={[styles.inner, { maxWidth: WEB_CONTENT_MAX_WIDTH }]}>
        <Pressable style={styles.brand} onPress={() => router.push('/(tabs)')}>
          <Image source={images.logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandText}>Ayya Matrimony</Text>
        </Pressable>

        <View style={styles.links}>
          {NAV_ITEMS.map((item) => {
            const active = item.isActive(pathname);
            return (
              <Pressable
                key={item.key}
                style={[styles.link, active && styles.linkActive]}
                onPress={() => router.push(item.href as never)}
              >
                <MaterialIcons
                  name={item.icon}
                  size={18}
                  color={active ? colors.primary : colors.onSurfaceVariant}
                />
                <Text style={[styles.linkText, active && styles.linkTextActive]}>
                  {translate(item.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          <LanguageLogoToggle variant="maroon" dense />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    backgroundColor: 'rgba(255, 251, 249, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(87, 0, 0, 0.08)',
    ...Platform.select({
      web: { boxShadow: '0 2px 16px rgba(87, 0, 0, 0.06)' },
      default: {},
    }),
  },
  inner: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: 12,
    gap: 16,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
    ...Platform.select({
      web: { cursor: 'pointer' as const },
      default: {},
    }),
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  brandText: {
    fontFamily: fonts.playfairSemi,
    fontSize: 20,
    color: colors.primary,
  },
  links: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    ...Platform.select({
      web: { cursor: 'pointer' as const },
      default: {},
    }),
  },
  linkActive: {
    backgroundColor: 'rgba(87, 0, 0, 0.08)',
  },
  linkText: {
    fontFamily: fonts.interSemi,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  linkTextActive: {
    color: colors.primary,
  },
  actions: {
    flexShrink: 0,
  },
});
