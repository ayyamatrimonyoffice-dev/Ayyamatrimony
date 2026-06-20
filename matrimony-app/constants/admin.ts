import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const adminColors = {
  primary: '#8B0000',
  primaryDark: '#570000',
  primaryLight: '#FFF5F5',
  background: '#F4F6F8',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  success: '#15803D',
  warning: '#CA8A04',
  danger: '#DC2626',
  info: '#2563EB',
};

export const ADMIN_SESSION_KEY = 'ayya_admin_session_v1';

/** Admin enters this number on the shared login screen — no OTP required. */
export const ADMIN_PHONE = '9999999999';

export const ADMIN_CREDENTIALS_HINT = `Admin phone: ${ADMIN_PHONE}`;

export function isAdminPhone(phone: string): boolean {
  return phone.replace(/\D/g, '') === ADMIN_PHONE;
}

export async function grantAdminSession(): Promise<void> {
  await AsyncStorage.setItem(ADMIN_SESSION_KEY, 'true');
}

export const adminTabs = {
  dashboard: 'Dashboard',
  users: 'Users',
  approvals: 'Approvals',
  notifications: 'Alerts',
  settings: 'Settings',
} as const;

export const ADMIN_FAB_GAP = 12;

export type AdminTabBarMetrics = {
  height: number;
  paddingTop: number;
  paddingBottom: number;
};

export function getAdminTabBarMetrics(bottomInset = 0): AdminTabBarMetrics {
  const paddingTop = 8;

  if (Platform.OS === 'web') {
    return {
      paddingTop,
      paddingBottom: 20,
      height: 92,
    };
  }

  const paddingBottom = Math.max(bottomInset + 10, 16);

  return {
    paddingTop,
    paddingBottom,
    height: 56 + paddingBottom,
  };
}

export function getAdminFabBottom(bottomInset = 0): number {
  return getAdminTabBarMetrics(bottomInset).height + ADMIN_FAB_GAP;
}
