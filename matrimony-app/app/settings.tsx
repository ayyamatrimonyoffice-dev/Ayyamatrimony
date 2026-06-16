import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { SelectField } from '@/components/FormControls';
import { SettingsRow } from '@/components/SettingsRow';
import { useLanguage } from '@/context/LanguageContext';
import { useGoBack } from '@/hooks/useGoBack';
import { defaultAppSettings, loadAppSettings, patchAppSettings } from '@/lib/appSettings';
import { colors, spacing, typography } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { language, setLanguage, translate } = useLanguage();
  const goBack = useGoBack('/(tabs)/profile');
  const [notifications, setNotifications] = useState(defaultAppSettings.pushNotifications);
  const [privateMode, setPrivateMode] = useState(defaultAppSettings.privateBrowsing);

  useEffect(() => {
    loadAppSettings().then((settings) => {
      setNotifications(settings.pushNotifications);
      setPrivateMode(settings.privateBrowsing);
    });
  }, []);

  const languageOptions = [
    { value: 'en', label: translate('english') },
    { value: 'ta', label: translate('tamil') },
  ];

  const handleNotificationsChange = (value: boolean) => {
    setNotifications(value);
    void patchAppSettings({ pushNotifications: value });
  };

  const handlePrivateModeChange = (value: boolean) => {
    setPrivateMode(value);
    void patchAppSettings({ privateBrowsing: value });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title={translate('settings')} showBack onBack={goBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.section}>{translate('account')}</Text>
        <SettingsRow
          label={translate('editMobileNumber')}
          onPress={() => router.push('/edit-mobile')}
        />
        <SettingsRow
          label={translate('changePassword')}
          onPress={() => router.push('/change-password')}
        />
        <View style={styles.languageField}>
          <SelectField
            label={translate('languageLabel')}
            value={language}
            onValueChange={(value) => void setLanguage(value as 'en' | 'ta')}
            options={languageOptions}
          />
        </View>

        <Text style={styles.section}>{translate('privacy')}</Text>
        <SettingToggle
          label={translate('pushNotifications')}
          value={notifications}
          onValueChange={handleNotificationsChange}
        />
        <SettingToggle
          label={translate('privateBrowsing')}
          value={privateMode}
          onValueChange={handlePrivateModeChange}
        />

        <Text style={styles.section}>{translate('support')}</Text>
        <SettingsRow
          label={translate('helpCenter')}
          onPress={() => router.push({ pathname: '/info/[type]', params: { type: 'help' } })}
        />
        <SettingsRow
          label={translate('termsConditions')}
          onPress={() => router.push({ pathname: '/info/[type]', params: { type: 'terms' } })}
        />
        <SettingsRow
          label={translate('privacyPolicy')}
          onPress={() => router.push({ pathname: '/info/[type]', params: { type: 'privacy' } })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingToggle({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <Pressable style={styles.row} onPress={() => onValueChange(!value)}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
        thumbColor={value ? colors.primary : '#f4f3f4'}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingTop: 80,
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: spacing.xl,
  },
  section: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(226, 191, 185, 0.15)',
  },
  rowLabel: {
    ...typography.labelLg,
    color: colors.onSurface,
    flex: 1,
    paddingRight: spacing.md,
  },
  languageField: {
    marginBottom: spacing.sm,
  },
});
