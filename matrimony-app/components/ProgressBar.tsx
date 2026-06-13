import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';

type ProgressBarProps = {
  progress: number;
  label?: string;
  stepLabel?: string;
};

export function ProgressBar({ progress, label, stepLabel }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      {(label || stepLabel) && (
        <View style={styles.row}>
          {stepLabel ? <Text style={styles.stepLabel}>{stepLabel}</Text> : <View />}
          {label ? <Text style={styles.percent}>{label}</Text> : null}
        </View>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped}%` }]} />
        <View style={[styles.thumb, { left: `${clamped}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  percent: {
    ...typography.labelSm,
    color: colors.primary,
    fontFamily: typography.labelSm.fontFamily,
  },
  track: {
    height: 6,
    backgroundColor: '#F5E6D3',
    borderRadius: 9999,
    overflow: 'visible',
    position: 'relative',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 9999,
  },
  thumb: {
    position: 'absolute',
    top: -3,
    width: 12,
    height: 12,
    marginLeft: -6,
    borderRadius: 6,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
