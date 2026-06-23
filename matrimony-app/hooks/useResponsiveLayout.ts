import { Platform, useWindowDimensions } from 'react-native';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const isNative = Platform.OS !== 'web';
  const isCompact = width < 400;
  const isMedium = width >= 400 && width < 768;
  const horizontalInset = isCompact ? 6 : isMedium ? 10 : 16;
  const quickActionCardWidth = Math.min(isCompact ? 118 : 108, Math.floor((width - 48) / 3));

  return {
    width,
    height,
    isNative,
    isCompact,
    isMedium,
    horizontalInset,
    quickActionCardWidth,
  };
}
