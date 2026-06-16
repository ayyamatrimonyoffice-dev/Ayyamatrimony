import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { TextField } from '@/components/FormControls';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useLanguage } from '@/context/LanguageContext';
import { useGoBack } from '@/hooks/useGoBack';
import { colors, spacing } from '@/constants/theme';

export default function ChangePasswordScreen() {
  const goBack = useGoBack('/settings');
  const { translate } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      const message = translate('fillRequiredDetails');
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert(message);
      }
      return;
    }

    if (newPassword !== confirmPassword) {
      const message = translate('passwordsDoNotMatch');
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert(message);
      }
      return;
    }

    const message = translate('passwordChanged');
    if (Platform.OS === 'web') {
      window.alert(message);
      goBack();
      return;
    }

    Alert.alert(message, undefined, [{ text: translate('ok'), onPress: goBack }]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title={translate('changePasswordTitle')} showBack onBack={goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <TextField
          label={translate('currentPassword')}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        <TextField
          label={translate('newPassword')}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        <TextField
          label={translate('confirmPassword')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="••••••••"
          secureTextEntry
        />
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label={translate('saveChanges')} onPress={handleSave} />
      </View>
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
    gap: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 191, 185, 0.1)',
  },
});
