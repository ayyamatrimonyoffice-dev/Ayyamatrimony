import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ADMIN_SESSION_KEY, isAdminPhone, isValidAdminPin, readAdminSession } from '@/constants/admin';

type AdminAuthContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  signIn: (phone: string, otp: string) => Promise<{ ok: boolean; message?: string }>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    void readAdminSession().then((authenticated) => {
      if (mounted) {
        setIsAuthenticated(authenticated);
        setIsReady(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (phone: string, otpOrPin = '') => {
    const normalizedPhone = phone.replace(/\D/g, '');
    if (!isAdminPhone(normalizedPhone)) {
      return { ok: false, message: 'Invalid admin phone number.' };
    }
    if (!isValidAdminPin(otpOrPin)) {
      return { ok: false, message: 'Invalid admin PIN.' };
    }
    await AsyncStorage.setItem(ADMIN_SESSION_KEY, 'true');
    setIsAuthenticated(true);
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ isReady, isAuthenticated, signIn, signOut }),
    [isReady, isAuthenticated, signIn, signOut],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
