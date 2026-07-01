import { Platform, useWindowDimensions } from 'react-native';
import {
  WEB_CONTENT_MAX_WIDTH,
  WEB_DESKTOP_MIN_WIDTH,
  WEB_FORM_MAX_WIDTH,
  WEB_LOGIN_MAX_WIDTH,
} from '@/constants/webLayout';

export function useWebLayout() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= WEB_DESKTOP_MIN_WIDTH;
  const isTablet = isWeb && width >= WEB_DESKTOP_MIN_WIDTH && width < 1024;

  return {
    width,
    height,
    isWeb,
    isDesktop,
    isTablet,
    contentMaxWidth: Math.min(width, WEB_CONTENT_MAX_WIDTH),
    loginMaxWidth: Math.min(width - 48, WEB_LOGIN_MAX_WIDTH),
    formMaxWidth: Math.min(width - 48, WEB_FORM_MAX_WIDTH),
  };
}
