import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SelectField } from '@/components/FormControls';
import { FormScreen, ToggleRow } from '@/components/FormScreen';
import { SettingsRow } from '@/components/SettingsRow';
import { useLanguage } from '@/context/LanguageContext';
import {
  AppSettings,
  defaultAppSettings,
  loadAppSettings,
  saveAppSettings,
} from '@/lib/appSettings';
import { colors, spacing, typography } from '@/constants/theme';

function SectionTitle({ label }: { label: string }) {
  return <Text style={styles.sectionTitle}>{label}</Text>;
}

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const { language, setLanguage, translate } = useLanguage();
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadAppSettings()
      .then(setSettings)
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    if (!isReady) {
      return;
    }

    void saveAppSettings(settings);
  };

  const languageOptions = [
    { value: 'en', label: translate('english') },
    { value: 'ta', label: translate('tamil') },
  ];

  return (
    <FormScreen titleKey="privacySettingsTitle" successKey="privacySaved" onSave={handleSave}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <SectionTitle label={translate('notifications')} />
        <ToggleRow
          label={translate('pushNotifications')}
          value={settings.pushNotifications}
          onValueChange={(value) => updateSetting('pushNotifications', value)}
        />

        <SectionTitle label={translate('privacySettings')} />
        <ToggleRow
          label={translate('profileVisibility')}
          value={settings.profileVisibility}
          onValueChange={(value) => updateSetting('profileVisibility', value)}
        />
        <ToggleRow
          label={translate('showPhoneNumber')}
          value={settings.showPhoneNumber}
          onValueChange={(value) => updateSetting('showPhoneNumber', value)}
        />
        <ToggleRow
          label={translate('showPhotos')}
          value={settings.showPhotos}
          onValueChange={(value) => updateSetting('showPhotos', value)}
        />
        <ToggleRow
          label={translate('allowMessages')}
          value={settings.allowMessages}
          onValueChange={(value) => updateSetting('allowMessages', value)}
        />
        <ToggleRow
          label={translate('privateBrowsing')}
          value={settings.privateBrowsing}
          onValueChange={(value) => updateSetting('privateBrowsing', value)}
        />

        <SectionTitle label={translate('account')} />
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

        <SectionTitle label={translate('advancedSettings')} />
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
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  languageField: {
    marginBottom: spacing.xs,
  },
});
