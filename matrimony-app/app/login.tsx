import { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useLanguage } from '@/context/LanguageContext';
import { SelectField } from '@/components/FormControls';
import { getFormOptions } from '@/constants/formOptions';
import { colors, spacing, typography } from '@/constants/theme';
import { images } from '@/constants/images';

export default function LoginScreen() {
  const router = useRouter();
  const { translate, language } = useLanguage();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const countryOptions = getFormOptions('countryCode', language);

  useEffect(() => {
    void import('@/lib/firebase').then(({ initFirebaseAnalytics }) => initFirebaseAnalytics());
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader showBack onBack={() => router.replace('/welcome')} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.branding}>
            <Image source={{ uri: images.logo }} style={styles.logo} />
            <Text style={styles.title}>{translate('welcomeBack')}</Text>
            <Text style={styles.subtitle}>{translate('loginSubtitle')}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>{translate('mobileNumber')}</Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryCodeWrap}>
                <SelectField
                  label=""
                  value={countryCode}
                  onValueChange={setCountryCode}
                  options={countryOptions}
                  showLabel={false}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder={translate('enterPhone')}
                placeholderTextColor="rgba(90, 65, 61, 0.4)"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <PrimaryButton
              label={translate('sendOtp')}
              icon="arrow-forward"
              onPress={() => router.replace('/otp')}
              style={styles.submit}
            />

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>{translate('orConnectWith')}</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialRow}>
              <Pressable style={styles.socialBtn}>
                <MaterialIcons name="mail" size={20} color="#4285F4" />
                <Text style={styles.socialText}>{translate('google')}</Text>
              </Pressable>
              <Pressable style={styles.socialBtn}>
                <MaterialIcons name="facebook" size={20} color="#1877F2" />
                <Text style={styles.socialText}>{translate('facebook')}</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.register}>
            {translate('newToMatrimony')} <Text style={styles.registerLink}>{translate('registerFree')}</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <View style={styles.trustRow}>
          <MaterialIcons name="verified-user" size={14} color={colors.onSurfaceVariant} />
          <Text style={styles.trustText}>{translate('verifiedProfiles')}</Text>
        </View>
        <Text style={styles.copyright}>{translate('copyright')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    flexGrow: 1,
    justifyContent: 'center',
  },
  branding: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 224, 136, 0.3)',
  },
  title: {
    ...typography.headlineLg,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    opacity: 0.8,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
  },
  fieldLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
    alignItems: 'flex-end',
  },
  countryCodeWrap: {
    width: 132,
    zIndex: 20,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  submit: {
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(226, 191, 185, 0.3)',
  },
  dividerText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    opacity: 0.5,
    marginHorizontal: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(226, 191, 185, 0.5)',
    borderRadius: 8,
  },
  socialText: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  register: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  registerLink: {
    color: colors.primary,
    fontFamily: typography.titleLg.fontFamily,
  },
  footer: {
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 191, 185, 0.1)',
    paddingTop: spacing.lg,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    ...typography.labelSm,
    color: 'rgba(90, 65, 61, 0.6)',
  },
  copyright: {
    fontSize: 10,
    color: 'rgba(90, 65, 61, 0.3)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
