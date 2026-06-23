import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { adminColors } from '@/constants/admin';

type AdminStatCardProps = {
  label: string;
  value: string | number;
  icon: keyof typeof MaterialIcons.glyphMap;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  onPress?: () => void;
};

const toneColors = {
  default: adminColors.primary,
  success: adminColors.success,
  warning: adminColors.warning,
  danger: adminColors.danger,
};

export function AdminStatCard({ label, value, icon, tone = 'default', onPress }: AdminStatCardProps) {
  const accent = toneColors[tone];

  const content = (
    <>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      <View style={styles.body}>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
          <MaterialIcons name={icon} size={18} color={accent} />
        </View>
        <Text style={styles.value}>{value}</Text>
        <View style={styles.iconSpacer} />
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: adminColors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: adminColors.border,
    gap: 8,
  },
  cardPressed: {
    opacity: 0.92,
  },
  label: {
    color: adminColors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconSpacer: {
    width: 30,
    height: 30,
    flexShrink: 0,
  },
  value: {
    flex: 1,
    color: adminColors.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
});
