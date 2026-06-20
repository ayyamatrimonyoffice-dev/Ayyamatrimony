import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PAYMENT_METHODS, type PaymentMethodId } from '@/constants/paymentMethods';
import { borderRadius, colors, fonts, spacing, typography } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';

type PaymentMethodModalProps = {
  visible: boolean;
  amount: number;
  onClose: () => void;
  onSelect: (method: PaymentMethodId) => void;
};

export function PaymentMethodModal({ visible, amount, onClose, onSelect }: PaymentMethodModalProps) {
  const { translate } = useLanguage();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>{translate('choosePaymentMethod')}</Text>
          <Text style={styles.amount}>₹ {amount.toLocaleString('en-IN')}</Text>

          <View style={styles.options}>
            {PAYMENT_METHODS.map((method) => (
              <Pressable
                key={method.id}
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                onPress={() => onSelect(method.id)}
              >
                <View style={[styles.optionIconWrap, { backgroundColor: method.tint }]}>
                  <MaterialCommunityIcons name={method.icon} size={22} color={method.accent} />
                </View>
                <Text style={styles.optionLabel}>{translate(method.labelKey)}</Text>
                <MaterialCommunityIcons name="chevron-right" size={22} color={colors.onSurfaceVariant} />
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>{translate('cancel')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 29, 35, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(87, 0, 0, 0.15)',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.headlineMd,
    fontSize: 20,
    color: colors.primary,
    textAlign: 'center',
    fontFamily: fonts.playfairSemi,
  },
  amount: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  options: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.1)',
    backgroundColor: '#FFFFFF',
  },
  optionPressed: {
    backgroundColor: '#FFF8F6',
    borderColor: colors.primary,
  },
  optionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    fontFamily: fonts.interSemi,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  cancelText: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.interSemi,
  },
});
