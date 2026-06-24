import { Platform, StyleSheet, Text } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { fonts } from '@/constants/theme';

type TabBarLabelProps = {
  color: string;
  children: string;
};

export function TabBarLabel({ color, children }: TabBarLabelProps) {
  const { language } = useLanguage();
  const isTamil = language === 'ta';

  return (
    <Text
      style={[styles.label, isTamil && styles.labelTamil, { color }]}
      numberOfLines={2}
      adjustsFontSizeToFit
      minimumFontScale={0.75}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.interSemi,
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
    marginTop: 2,
    width: '100%',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  labelTamil: {
    fontSize: 9,
    lineHeight: 11,
    marginTop: 1,
  },
});
