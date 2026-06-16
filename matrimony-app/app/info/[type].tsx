import { ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKey } from '@/constants/i18n';
import { useGoBack } from '@/hooks/useGoBack';
import { colors, spacing, typography } from '@/constants/theme';

const INFO_PAGES: Record<string, { titleKey: TranslationKey; bodyKey: TranslationKey }> = {
  help: { titleKey: 'helpCenter', bodyKey: 'helpCenterBody' },
  terms: { titleKey: 'termsConditions', bodyKey: 'termsBody' },
  privacy: { titleKey: 'privacyPolicy', bodyKey: 'privacyPolicyBody' },
};

export default function InfoScreen() {
  const { type } = useLocalSearchParams<{ type?: string | string[] }>();
  const goBack = useGoBack('/settings');
  const { translate } = useLanguage();
  const pageType = Array.isArray(type) ? type[0] : type;
  const page = INFO_PAGES[pageType ?? ''] ?? INFO_PAGES.help;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title={translate(page.titleKey)} showBack onBack={goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.body}>{translate(page.bodyKey)}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 96,
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: spacing.xl,
  },
  body: {
    ...typography.bodyMd,
    color: colors.onSurface,
    lineHeight: 24,
  },
});
