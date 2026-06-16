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
import { ADMIN_OTP, ADMIN_PHONE, ADMIN_SESSION_KEY } from '@/constants/admin';

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
    void AsyncStorage.getItem(ADMIN_SESSION_KEY).then((value) => {
      if (mounted) {
        setIsAuthenticated(value === 'true');
        setIsReady(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (phone: string, otp: string) => {
    const normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone !== ADMIN_PHONE) {
      return { ok: false, message: 'Invalid admin phone number.' };
    }
    if (otp.trim() !== ADMIN_OTP) {
      return { ok: false, message: 'Invalid OTP.' };
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
