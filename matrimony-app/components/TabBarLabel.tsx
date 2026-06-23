import { Platform, StyleSheet, Text } from 'react-native';
import { fonts } from '@/constants/theme';

type TabBarLabelProps = {
  color: string;
  children: string;
};

export function TabBarLabel({ color, children }: TabBarLabelProps) {
  return (
    <Text
      style={[styles.label, { color }]}
      numberOfLines={2}
      adjustsFontSizeToFit
      minimumFontScale={0.82}
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
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
});
