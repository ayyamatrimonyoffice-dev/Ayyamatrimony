import AsyncStorage from '@react-native-async-storage/async-storage';

const ADMIN_DASHBOARD_CACHE_KEY = 'ayya_admin_dashboard_v1';
const ADMIN_APPROVALS_KEY = 'ayya_admin_approvals_v1';
const ADMIN_PHOTO_APPROVALS_KEY = 'ayya_admin_photo_approvals_v1';

/** Clear cached admin dashboard / approval lists after profile deletes. */
export async function invalidateAdminCaches(): Promise<void> {
  await AsyncStorage.multiRemove([
    ADMIN_DASHBOARD_CACHE_KEY,
    ADMIN_APPROVALS_KEY,
    ADMIN_PHOTO_APPROVALS_KEY,
  ]);
}
