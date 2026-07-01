import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { getFirebaseFirestore } from '@/lib/firebase';
import { listPayments, type AdminPaymentRecord } from '@/lib/firestore/paymentService';

const ADMIN_PAYMENTS_KEY = 'ayya_admin_payments_v1';
const PAYMENTS_REFRESH_STALE_MS = 30_000;

type AdminPaymentsContextValue = {
  isReady: boolean;
  items: AdminPaymentRecord[];
  refresh: (options?: { force?: boolean }) => Promise<void>;
};

const AdminPaymentsContext = createContext<AdminPaymentsContextValue | null>(null);

async function readCachedPayments(): Promise<AdminPaymentRecord[] | null> {
  const raw = await AsyncStorage.getItem(ADMIN_PAYMENTS_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AdminPaymentRecord[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function AdminPaymentsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isReady: authReady } = useAdminAuth();
  const [isReady, setIsReady] = useState(false);
  const [items, setItems] = useState<AdminPaymentRecord[]>([]);
  const lastRefreshAtRef = useRef(0);

  const refresh = useCallback(async (options?: { force?: boolean }) => {
    const force = options?.force ?? false;
    const now = Date.now();
    if (!force && items.length > 0 && now - lastRefreshAtRef.current < PAYMENTS_REFRESH_STALE_MS) {
      setIsReady(true);
      return;
    }

    const cached = await readCachedPayments();
    if (cached && cached.length > 0) {
      setItems(cached);
      setIsReady(true);
    }

    const db = await getFirebaseFirestore();
    if (!db) {
      setIsReady(true);
      return;
    }

    try {
      const remote = await listPayments();
      setItems(remote);
      lastRefreshAtRef.current = Date.now();
      if (remote.length > 0) {
        await AsyncStorage.setItem(ADMIN_PAYMENTS_KEY, JSON.stringify(remote));
      }
    } catch {
      if (!cached || cached.length === 0) {
        const fallback = await readCachedPayments();
        if (fallback && fallback.length > 0) {
          setItems(fallback);
        }
      }
    } finally {
      setIsReady(true);
    }
  }, [items.length]);

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      return;
    }
    void refresh({ force: true });
  }, [authReady, isAuthenticated, refresh]);

  const value = useMemo(
    () => ({ isReady, items, refresh }),
    [isReady, items, refresh],
  );

  return (
    <AdminPaymentsContext.Provider value={value}>{children}</AdminPaymentsContext.Provider>
  );
}

export function useAdminPayments() {
  const context = useContext(AdminPaymentsContext);
  if (!context) {
    throw new Error('useAdminPayments must be used within AdminPaymentsProvider');
  }
  return context;
}
