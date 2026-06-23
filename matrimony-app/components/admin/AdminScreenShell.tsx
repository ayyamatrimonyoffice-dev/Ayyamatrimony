import { ReactNode } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminColors } from '@/constants/admin';
import { images } from '@/constants/images';
import { AdminLanguageToggle } from '@/components/admin/AdminLanguageToggle';

type AdminScreenShellProps = {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  showLanguageToggle?: boolean;
  hideHeader?: boolean;
  onBack?: () => void;
  children: ReactNode;
  headerRight?: ReactNode;
  pinnedContent?: ReactNode;
};

export function AdminScreenShell({
  title,
  subtitle,
  showLogo = false,
  showLanguageToggle = false,
  hideHeader = false,
  onBack,
  children,
  headerRight,
  pinnedContent,
}: AdminScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {hideHeader ? null : (
        <View style={styles.header}>
          {onBack ? (
            <Pressable style={styles.backBtn} onPress={onBack} hitSlop={8}>
              <MaterialIcons name="arrow-back" size={22} color={adminColors.text} />
            </Pressable>
          ) : null}
          <View style={showLogo ? styles.headerBrandRow : styles.headerTextWrap}>
            {showLogo ? (
              <View style={styles.logoRing}>
                <View style={styles.logoWrap}>
                  <Image source={images.logo} style={styles.logo} resizeMode="contain" />
                </View>
              </View>
            ) : null}
            <View style={styles.headerTextWrap}>
              {title ? (
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={1}>
                    {title}
                  </Text>
                  {showLanguageToggle ? <AdminLanguageToggle /> : null}
                </View>
              ) : null}
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          </View>
          {headerRight}
        </View>
      )}
      {pinnedContent ? <View style={styles.pinned}>{pinnedContent}</View> : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: adminColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: adminColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: adminColors.border,
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: adminColors.background,
  },
  headerBrandRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  logoRing: {
    padding: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.2)',
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(87, 0, 0, 0.12)' },
      default: {
        shadowColor: '#570000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: adminColors.primaryLight,
    padding: 4,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    flex: 1,
    color: adminColors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: adminColors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  pinned: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: adminColors.background,
    zIndex: 2,
    ...Platform.select({
      web: { position: 'relative' as const },
      default: {},
    }),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 12,
  },
});
