import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { colors, spacing, typography } from '@/constants/theme';

type AppHeaderProps = {
  title?: string;
  showBack?: boolean;
  showTamil?: boolean;
  onBack?: () => void;
  rightElement?: ReactNode;
  dark?: boolean;
};

export function AppHeader({
  title,
  showBack = false,
  showTamil = true,
  onBack,
  rightElement,
  dark = false,
}: AppHeaderProps) {
  const router = useRouter();
  const { translate, toggleLanguage } = useLanguage();
  const headerTitle = title ?? translate('matrimony');

  return (
    <View style={[styles.header, dark && styles.headerDark]}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable
            onPress={onBack ?? (() => router.back())}
            style={styles.iconButton}
            hitSlop={8}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={dark ? colors.secondaryFixed : colors.surfaceTint}
            />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      <Text style={[styles.title, dark && styles.titleDark]}>{headerTitle}</Text>
      <View style={styles.side}>
        {rightElement ?? (showTamil ? (
          <Pressable onPress={toggleLanguage} style={styles.languageButton} hitSlop={8}>
            <Text style={styles.tamil}>{translate('languageToggle')}</Text>
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 191, 185, 0.2)',
    backgroundColor: 'rgba(246, 250, 255, 0.9)',
  },
  headerDark: {
    backgroundColor: 'transparent',
    borderBottomColor: 'rgba(255, 224, 136, 0.1)',
  },
  side: {
    width: 72,
    alignItems: 'flex-start',
  },
  iconButton: {
    padding: 4,
  },
  placeholder: {
    width: 24,
    height: 24,
  },
  title: {
    ...typography.headlineMd,
    fontSize: 20,
    color: colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  titleDark: {
    color: colors.secondaryFixed,
  },
  tamil: {
    ...typography.labelLg,
    color: colors.surfaceTint,
  },
  languageButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
