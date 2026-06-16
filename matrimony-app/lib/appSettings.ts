import AsyncStorage from '@react-native-async-storage/async-storage';

export const SETTINGS_STORAGE_KEY = 'app_settings';

export type AppSettings = {
  pushNotifications: boolean;
  profileVisibility: boolean;
  showPhoneNumber: boolean;
  showPhotos: boolean;
  allowMessages: boolean;
  privateBrowsing: boolean;
};

export const defaultAppSettings: AppSettings = {
  pushNotifications: true,
  profileVisibility: true,
  showPhoneNumber: false,
  showPhotos: true,
  allowMessages: true,
  privateBrowsing: false,
};

export async function loadAppSettings(): Promise<AppSettings> {
  const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!stored) {
    return { ...defaultAppSettings };
  }

  try {
    const parsed = JSON.parse(stored) as Partial<AppSettings>;
    return { ...defaultAppSettings, ...parsed };
  } catch {
    return { ...defaultAppSettings };
  }
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export async function patchAppSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  const current = await loadAppSettings();
  const next = { ...current, ...partial };
  await saveAppSettings(next);
  return next;
}
