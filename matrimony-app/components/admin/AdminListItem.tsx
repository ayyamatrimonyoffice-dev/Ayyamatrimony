import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { adminColors } from '@/constants/admin';

type AdminListItemProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: string;
  badgeColor?: string;
  onPress?: () => void;
};

export function AdminListItem({
  title,
  subtitle,
  meta,
  badge,
  badgeColor = adminColors.primary,
  onPress,
}: AdminListItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: `${badgeColor}18` }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
        </View>
      ) : null}
      {onPress ? <MaterialIcons name="chevron-right" size={20} color={adminColors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: adminColors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: adminColors.border,
  },
  cardPressed: {
    opacity: 0.92,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: adminColors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    color: adminColors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  meta: {
    color: adminColors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
