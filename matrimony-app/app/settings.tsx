import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { SelectField } from '@/components/FormControls';
import { useLanguage } from '@/context/LanguageContext';
import { useGoBack } from '@/hooks/useGoBack';
import { colors, spacing, typography } from '@/constants/theme';

export default function SettingsScreen() {
  const { language, setLanguage, translate } = useLanguage();
  const goBack = useGoBack('/(tabs)/profile');
  const [notifications, setNotifications] = useState(true);
  const [privateMode, setPrivateMode] = useState(false);

  const languageOptions = [
    { value: 'en', label: translate('english') },
    { value: 'ta', label: translate('tamil') },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title={translate('settings')} showBack onBack={goBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.section}>{translate('account')}</Text>
        <SettingRow label={translate('editMobileNumber')} />
        <SettingRow label={translate('changePassword')} />
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
          onValueChange={setNotifications}
        />
        <SettingToggle
          label={translate('privateBrowsing')}
          value={privateMode}
          onValueChange={setPrivateMode}
        />

        <Text style={styles.section}>{translate('support')}</Text>
        <SettingRow label={translate('helpCenter')} />
        <SettingRow label={translate('termsConditions')} />
        <SettingRow label={translate('privacyPolicy')} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
    </Pressable>
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
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
        thumbColor={value ? colors.primary : '#f4f3f4'}
      />
    </View>
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
  },
  rowValue: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
  },
  languageField: {
    marginBottom: spacing.sm,
  },
});
