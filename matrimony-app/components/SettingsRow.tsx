import { Pressable, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/constants/theme';

type SettingsRowProps = {
  label: string;
  value?: string;
  onPress?: () => void;
};

export function SettingsRow({ label, value, onPress }: SettingsRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.rowPressed : null]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.label}>{label}</Text>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {onPress ? <MaterialIcons name="chevron-right" size={22} color={colors.onSurfaceVariant} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
    gap: spacing.sm,
  },
  rowPressed: {
    opacity: 0.85,
    backgroundColor: colors.surfaceContainerLow,
  },
  label: {
    ...typography.labelLg,
    color: colors.onSurface,
    flex: 1,
  },
  value: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
  },
});
