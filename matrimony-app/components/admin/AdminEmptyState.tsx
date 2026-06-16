import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { adminColors } from '@/constants/admin';

type AdminEmptyStateProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  message: string;
};

export function AdminEmptyState({ icon, title, message }: AdminEmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <MaterialIcons name={icon} size={28} color={adminColors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: adminColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: adminColors.border,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: adminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    color: adminColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    color: adminColors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
});
