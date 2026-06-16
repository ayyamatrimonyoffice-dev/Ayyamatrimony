import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const PROFILE_STORAGE_KEY = 'user_profile';

type ProfileFormContextValue = {
  values: Record<string, string>;
  isReady: boolean;
  setValue: (key: string, value: string) => void;
  getValue: (key: string) => string;
  clearProfile: () => Promise<void>;
};

const ProfileFormContext = createContext<ProfileFormContextValue | null>(null);

function parseStoredProfile(raw: string | null): Record<string, string> {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    );
  } catch {
    return {};
  }
}

export function ProfileFormProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_STORAGE_KEY)
      .then((stored) => {
        setValues(parseStoredProfile(stored));
      })
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  const persistValues = useCallback(async (nextValues: Record<string, string>) => {
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextValues));
  }, []);

  const setValue = useCallback(
    (key: string, nextValue: string) => {
      setValues((current) => {
        const next = { ...current, [key]: nextValue };
        void persistValues(next);
        return next;
      });
    },
    [persistValues],
  );

  const clearProfile = useCallback(async () => {
    setValues({});
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      values,
      isReady,
      setValue,
      getValue: (key: string) => values[key] ?? '',
      clearProfile,
    }),
    [clearProfile, isReady, setValue, values],
  );

  return <ProfileFormContext.Provider value={value}>{children}</ProfileFormContext.Provider>;
}

export function useProfileForm() {
  const context = useContext(ProfileFormContext);
  if (!context) {
    throw new Error('useProfileForm must be used within ProfileFormProvider');
  }
  return context;
}
