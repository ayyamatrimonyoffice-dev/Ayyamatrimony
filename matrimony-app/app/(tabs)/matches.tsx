import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { MatchCard } from '@/components/MatchCard';
import { useLanguage } from '@/context/LanguageContext';
import { colors, spacing, typography } from '@/constants/theme';
import { images } from '@/constants/images';

export default function MatchesScreen() {
  const { translate } = useLanguage();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader title={translate('matches')} showBack={false} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subtitle}>{translate('matchesSubtitle')}</Text>
        {images.matches.map((match) => (
          <View key={match.name} style={styles.cardWrap}>
            <MatchCard {...match} />
          </View>
        ))}
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
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: spacing.xl,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  cardWrap: {
    marginBottom: 0,
  },
});
