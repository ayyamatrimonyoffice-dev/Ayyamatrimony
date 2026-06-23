import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { adminColors } from '@/constants/admin';

export function AdminLanguageToggle() {
  const { language, setLanguage, translate } = useLanguage();

  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.btn, language === 'ta' && styles.btnActive]}
        onPress={() => void setLanguage('ta')}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={translate('adminLangTamil')}
      >
        <Text style={[styles.btnText, language === 'ta' && styles.btnTextActive]}>த</Text>
      </Pressable>
      <Pressable
        style={[styles.btn, language === 'en' && styles.btnActive]}
        onPress={() => void setLanguage('en')}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={translate('adminLangEnglish')}
      >
        <Text style={[styles.btnText, language === 'en' && styles.btnTextActive]}>E</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  btn: {
    minWidth: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: adminColors.border,
    backgroundColor: adminColors.surface,
    paddingHorizontal: 6,
  },
  btnActive: {
    backgroundColor: adminColors.primary,
    borderColor: adminColors.primary,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
    color: adminColors.textMuted,
    lineHeight: 16,
  },
  btnTextActive: {
    color: '#fff',
  },
});
