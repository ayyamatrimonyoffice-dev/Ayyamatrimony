import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Language, tf, TranslationKey, t } from '@/constants/i18n';

const LANGUAGE_STORAGE_KEY = 'app_language';

type LanguageContextValue = {
  language: Language;
  isReady: boolean;
  setLanguage: (language: Language) => Promise<void>;
  toggleLanguage: () => void;
  translate: (key: TranslationKey) => string;
  translateFormat: (key: TranslationKey, vars: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((stored) => {
        if (stored === 'en' || stored === 'ta') {
          setLanguageState(stored);
        }
      })
      .finally(() => setIsReady(true));
  }, []);

  const setLanguage = useCallback(async (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    void setLanguage(language === 'en' ? 'ta' : 'en');
  }, [language, setLanguage]);

  const value = useMemo(
    () => ({
      language,
      isReady,
      setLanguage,
      toggleLanguage,
      translate: (key: TranslationKey) => t(language, key),
      translateFormat: (key: TranslationKey, vars: Record<string, string | number>) =>
        tf(language, key, vars),
    }),
    [language, isReady, setLanguage, toggleLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
