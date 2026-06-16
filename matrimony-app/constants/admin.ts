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

/** Admin login credentials (admin panel only — separate from user app auth). */
export const ADMIN_PHONE = '9999999999';
export const ADMIN_OTP = '123456';

export const adminTabs = {
  dashboard: 'Dashboard',
  users: 'Users',
  approvals: 'Approvals',
  notifications: 'Alerts',
  settings: 'Settings',
} as const;
