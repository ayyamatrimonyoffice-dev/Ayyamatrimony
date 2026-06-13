import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type ProfileFormContextValue = {
  values: Record<string, string>;
  setValue: (key: string, value: string) => void;
  getValue: (key: string) => string;
};

const ProfileFormContext = createContext<ProfileFormContextValue | null>(null);

export function ProfileFormProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<Record<string, string>>({});

  const value = useMemo(
    () => ({
      values,
      setValue: (key: string, nextValue: string) => {
        setValues((current) => ({ ...current, [key]: nextValue }));
      },
      getValue: (key: string) => values[key] ?? '',
    }),
    [values],
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
