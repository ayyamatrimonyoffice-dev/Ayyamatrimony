import { ActivityIndicator, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter, type Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguageLogoToggle } from '@/components/LanguageLogoToggle';
import { images } from '@/constants/images';
import {
  REGISTRATION_COMMUNITIES,
  type RegistrationCommunityId,
} from '@/constants/registrationCommunities';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import { hasCompletedProfile } from '@/constants/profileCompletion';
import { useLanguage } from '@/context/LanguageContext';
import { useProfileForm } from '@/context/ProfileFormContext';
import { useSubscription } from '@/context/SubscriptionContext';

export default function SelectCommunityScreen() {
  const router = useRouter();
  const { translate } = useLanguage();
  const { values, isReady: profileReady, setValue } = useProfileForm();
  const { isReady: subscriptionReady, isLoggedIn, logout } = useSubscription();

  if (!profileReady || !subscriptionReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="/" />;
  }

  if (hasCompletedProfile(values)) {
    return <Redirect href="/(tabs)" />;
  }

  const handleBack = () => {
    void (async () => {
      if (isLoggedIn && !hasCompletedProfile(values)) {
        await logout();
      }
      router.replace('/' as Href);
    })();
  };

  const handleSelect = (id: RegistrationCommunityId, religion: 'hindu' | 'christian') => {
    setValue('registrationCommunity', id);
    setValue('religion', religion);
    router.replace({
      pathname: '/create-profile',
      params: { community: id, religion },
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FFF9F8', '#F6FAFF']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable
            onPress={handleBack}
            hitSlop={10}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          >
            <MaterialIcons name="arrow-back" size={22} color={colors.primary} />
          </Pressable>
          <LanguageLogoToggle variant="maroon" compact dense />
        </View>

        <View style={styles.content}>
          <View style={styles.branding}>
            <View style={styles.logoWrap}>
              <Image source={images.logo} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.title}>{translate('selectCommunityTitle')}</Text>
            <Text style={styles.subtitle}>{translate('selectCommunitySubtitle')}</Text>
          </View>

          <View style={styles.optionsCard}>
            {REGISTRATION_COMMUNITIES.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => handleSelect(option.id, option.religion)}
                style={({ pressed }) => [
                  styles.optionButton,
                  pressed && styles.optionButtonPressed,
                ]}
              >
                <View style={styles.optionIconWrap}>
                  <MaterialIcons
                    name={option.religion === 'hindu' ? 'temple-hindu' : 'church'}
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.optionLabel}>{translate(option.labelKey)}</Text>
                <MaterialIcons name="chevron-right" size={22} color={colors.primary} />
              </Pressable>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const cardShadow = Platform.select({
  web: { boxShadow: '0 12px 32px rgba(87, 0, 0, 0.08)' },
  default: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
});

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F7FC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F7FC',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.08)',
  },
  backButtonPressed: {
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  branding: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    marginBottom: spacing.xs,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    ...typography.titleLg,
    color: colors.primary,
    fontFamily: fonts.playfairSemi,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 20,
  },
  optionsCard: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: spacing.md,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.08)',
    ...cardShadow,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.1)',
    backgroundColor: '#FFFBF8',
  },
  optionButtonPressed: {
    backgroundColor: '#FFF0ED',
    borderColor: colors.primary,
  },
  optionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(87, 0, 0, 0.06)',
  },
  optionLabel: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.primary,
    fontFamily: fonts.interSemi,
  },
});
