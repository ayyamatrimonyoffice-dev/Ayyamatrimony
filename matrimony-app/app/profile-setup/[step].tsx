import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import {
  DatePickerField,
  SelectOptionsField,
  TextField,
} from '@/components/FormControls';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import {
  profileOptionStepKeys,
  profileStepFieldConfig,
} from '@/constants/formOptions';
import { getNextStepId, getPreviousStepId, getProfileStep } from '@/constants/profileSteps';
import { useLanguage } from '@/context/LanguageContext';
import { useProfileForm } from '@/context/ProfileFormContext';
import { colors, spacing, typography } from '@/constants/theme';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { language, translate, translateFormat } = useLanguage();
  const { getValue, setValue } = useProfileForm();
  const { step: stepId } = useLocalSearchParams<{ step: string }>();
  const step = getProfileStep(stepId ?? '1', language);
  const optionKey = step ? profileOptionStepKeys[step.id] : undefined;
  const [selected, setSelected] = useState<string | null>(null);

  const fieldConfigs = useMemo(
    () => (step ? profileStepFieldConfig[step.id] ?? [] : []),
    [step],
  );

  useEffect(() => {
    if (optionKey) {
      setSelected(getValue(optionKey) || null);
    }
  }, [optionKey, getValue, stepId]);

  if (!step) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.error}>{translate('stepNotFound')}</Text>
      </SafeAreaView>
    );
  }

  const progress = Math.round((step.step / step.total) * 100);
  const nextStepId = getNextStepId(step.id, language);

  const isStepComplete = () => {
    if (step.options && optionKey) {
      return Boolean(selected);
    }
    if (fieldConfigs.length > 0) {
      return fieldConfigs.every((config) => Boolean(getValue(config.fieldKey)));
    }
    return true;
  };

  const handleContinue = () => {
    if (optionKey && selected) {
      setValue(optionKey, selected);
    }
    if (nextStepId) {
      router.replace(`/profile-setup/${nextStepId}`);
      return;
    }
    router.replace('/(tabs)');
  };

  const handleBack = () => {
    const previousStepId = getPreviousStepId(step.id, language);
    if (previousStepId) {
      router.replace(`/profile-setup/${previousStepId}`);
      return;
    }
    router.replace('/otp');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader showBack onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <ProgressBar
          progress={progress}
          stepLabel={translateFormat('stepOf', { current: step.step, total: step.total })}
          label={translateFormat('percentComplete', { percent: progress })}
        />

        <View style={styles.question}>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.subtitle}>{step.subtitle}</Text>
        </View>

        {step.options ? (
          <View style={styles.optionsGrid}>
            {step.options.map((option) => {
              const isSelected = selected === option.label;
              return (
                <Pressable
                  key={option.label}
                  onPress={() => setSelected(option.label)}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                    option.wide && styles.optionWide,
                  ]}
                >
                  <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
                    <MaterialIcons name={option.icon} size={28} color={colors.primary} />
                  </View>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {step.fields && fieldConfigs.length > 0 ? (
          <View style={styles.fields}>
            {step.fields.map((field, index) => {
              const config = fieldConfigs[index];
              if (!config) {
                return null;
              }

              const value = getValue(config.fieldKey);
              const onChange = (nextValue: string) => setValue(config.fieldKey, nextValue);

              if (config.kind === 'date') {
                return (
                  <DatePickerField
                    key={config.fieldKey}
                    label={field.label}
                    value={value}
                    onValueChange={onChange}
                    placeholder={field.placeholder}
                    language={language}
                  />
                );
              }

              if (config.kind === 'select' && config.optionsKey) {
                return (
                  <SelectOptionsField
                    key={config.fieldKey}
                    label={field.label}
                    value={value}
                    onValueChange={onChange}
                    optionsKey={config.optionsKey}
                    language={language}
                    placeholder={field.placeholder}
                  />
                );
              }

              return (
                <TextField
                  key={config.fieldKey}
                  label={field.label}
                  value={value}
                  onChangeText={onChange}
                  placeholder={field.placeholder}
                  multiline={config.multiline}
                />
              );
            })}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={nextStepId ? translate('continue') : translate('finishSetup')}
          icon="arrow-forward"
          onPress={handleContinue}
          disabled={!isStepComplete()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.containerMargin,
    paddingTop: 80,
    paddingBottom: spacing.xl,
  },
  question: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.headlineLg,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 320,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '47%',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(226, 191, 185, 0.3)',
    borderRadius: 12,
  },
  optionWide: {
    width: '100%',
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainerLow,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  optionIconSelected: {
    backgroundColor: colors.primaryFixedDim,
  },
  optionLabel: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  fields: {
    gap: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 191, 185, 0.1)',
  },
  error: {
    ...typography.bodyMd,
    color: colors.error,
    textAlign: 'center',
    marginTop: 100,
  },
});
