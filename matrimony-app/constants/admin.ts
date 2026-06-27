import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, type ViewStyle } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/lib/firestore/collections';

export const adminColors = {
  primary: '#8B0000',
  primaryDark: '#570000',
  primaryLight: '#FFF5F5',
  background: '#F7F4F2',
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

/** Admin enters this number on the shared login screen. */
export const ADMIN_PHONE = '9543692900';

/** Admin PIN required after entering the admin phone on the login screen. */
export const ADMIN_PIN = '4321';
export const ADMIN_PIN_LENGTH = 4;

export const ADMIN_CREDENTIALS_HINT = `Admin phone: ${ADMIN_PHONE}`;

export function isAdminPhone(phone: string): boolean {
  return phone.replace(/\D/g, '') === ADMIN_PHONE;
}

export function normalizeAdminPin(pin: string): string {
  return pin.replace(/\D/g, '').slice(0, ADMIN_PIN_LENGTH);
}

export function isValidAdminPin(pin: string): boolean {
  return normalizeAdminPin(pin) === ADMIN_PIN;
}

export async function grantAdminSession(): Promise<void> {
  await AsyncStorage.setItem(ADMIN_SESSION_KEY, 'true');

  const db = await getFirebaseFirestore();
  if (!db) {
    return;
  }

  await setDoc(
    doc(db, FIRESTORE_COLLECTIONS.adminUsers, `phone_${ADMIN_PHONE}`),
    {
      adminId: `phone_${ADMIN_PHONE}`,
      phone: ADMIN_PHONE,
      name: 'Ayya Admin',
      role: 'super_admin',
      active: true,
      createdAt: Date.now(),
    },
    { merge: true },
  );
}

export const adminTabs = {
  dashboard: 'Dashboard',
  users: 'Approvals',
  approvals: 'Approvals',
  members: 'Approvals',
  payments: 'Payments',
  photos: 'Photos',
  matches: 'Matches',
  notifications: 'Alerts',
  settings: 'Settings',
} as const;

export const ADMIN_FAB_GAP = 12;
export const ADMIN_FAB_SIZE = 58;
export const ADMIN_TAB_BAR_CONTENT_HEIGHT = 58;
const ADMIN_TAB_BAR_TOP_PADDING = 8;

export type AdminTabBarMetrics = {
  height: number;
  paddingTop: number;
  paddingBottom: number;
  contentHeight: number;
};

export function resolveAdminBottomInset(bottomInset = 0): number {
  if (bottomInset > 0) {
    return bottomInset;
  }
  return Platform.OS === 'android' ? 8 : Platform.OS === 'ios' ? 4 : 16;
}

export function getAdminTabBarMetrics(bottomInset = 0, tamilLabels = false): AdminTabBarMetrics {
  const paddingBottom = resolveAdminBottomInset(bottomInset);
  const paddingTop = ADMIN_TAB_BAR_TOP_PADDING;
  const contentHeight = tamilLabels ? 66 : ADMIN_TAB_BAR_CONTENT_HEIGHT;

  return {
    paddingTop,
    paddingBottom,
    contentHeight,
    height: contentHeight + paddingTop + paddingBottom,
  };
}

/** Navigator tabBarStyle — fixed at the bottom via normal layout flow (not absolute). */
export function getAdminNavigatorTabBarStyle(bottomInset = 0, tamilLabels = false): ViewStyle {
  const metrics = getAdminTabBarMetrics(bottomInset, tamilLabels);

  return {
    backgroundColor: adminColors.surface,
    borderTopColor: adminColors.border,
    borderTopWidth: 1,
    height: metrics.height,
    minHeight: metrics.height,
    paddingTop: metrics.paddingTop,
    paddingBottom: metrics.paddingBottom,
    width: '100%',
    alignSelf: 'stretch',
    ...Platform.select({
      android: { elevation: 12 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      web: {
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08)',
      },
      default: {},
    }),
  };
}

export function getAdminFabBottom(bottomInset = 0, tamilLabels = false): number {
  return getAdminTabBarMetrics(bottomInset, tamilLabels).height + ADMIN_FAB_GAP;
}

/** Bottom inset for scrollable admin scenes (matches tab bar footprint). */
export function getAdminSceneBottomInset(bottomInset = 0): number {
  return Platform.OS === 'web' ? getAdminTabBarMetrics(bottomInset).height : 0;
}

/** Scroll content padding — native scenes already clear the pinned tab bar. */
export function getAdminScrollContentBottomPad(bottomInset = 0): number {
  const fabPad = ADMIN_FAB_SIZE + ADMIN_FAB_GAP + 20;
  if (Platform.OS === 'web') {
    return getAdminFabBottom(bottomInset) + 20;
  }
  return fabPad;
}
