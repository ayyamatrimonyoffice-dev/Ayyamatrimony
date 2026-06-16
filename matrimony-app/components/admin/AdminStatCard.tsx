import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { adminColors } from '@/constants/admin';

type AdminStatCardProps = {
  label: string;
  value: string | number;
  icon: keyof typeof MaterialIcons.glyphMap;
  tone?: 'default' | 'success' | 'warning' | 'danger';
};

const toneColors = {
  default: adminColors.primary,
  success: adminColors.success,
  warning: adminColors.warning,
  danger: adminColors.danger,
};

export function AdminStatCard({ label, value, icon, tone = 'default' }: AdminStatCardProps) {
  const accent = toneColors[tone];

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
        <MaterialIcons name={icon} size={22} color={accent} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: adminColors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: adminColors.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  value: {
    color: adminColors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  label: {
    color: adminColors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
});
