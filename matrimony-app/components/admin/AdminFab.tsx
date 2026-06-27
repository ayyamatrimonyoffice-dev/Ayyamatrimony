import { Pressable, Platform, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { adminColors, getAdminFabBottom } from '@/constants/admin';
import { useLanguage } from '@/context/LanguageContext';

type AdminFabProps = {
  onPress: () => void;
};

export function AdminFab({ onPress }: AdminFabProps) {
  const insets = useSafeAreaInsets();
  const { translate, language } = useLanguage();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);
  const bottom = getAdminFabBottom(bottomInset, language === 'ta');

  return (
    <View style={[styles.wrap, { bottom }]} pointerEvents="box-none">
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={translate('adminAddMemberFab')}
      >
        <MaterialIcons name="add" size={30} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 20,
    zIndex: 50,
    elevation: 8,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: adminColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
});
