import { BottomTabBar, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminColors, ADMIN_TAB_BAR_CONTENT_HEIGHT } from '@/constants/admin';

export function AdminTabBar(props: BottomTabBarProps) {
  if (Platform.OS === 'web') {
    return <BottomTabBar {...props} />;
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <BottomTabBar
        {...props}
        style={[props.style, styles.bar]}
        insets={{
          ...props.insets,
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: adminColors.surface,
    borderTopWidth: 1,
    borderTopColor: adminColors.border,
  },
  bar: {
    minHeight: ADMIN_TAB_BAR_CONTENT_HEIGHT,
    paddingTop: 6,
    backgroundColor: adminColors.surface,
  },
});
