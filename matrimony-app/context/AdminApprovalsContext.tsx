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
import type { AdminApprovalRecord } from '@/constants/adminMockData';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { getFirebaseFirestore } from '@/lib/firebase';
import { listApprovals, updateApprovalStatus } from '@/lib/firestore/approvalService';

const ADMIN_APPROVALS_KEY = 'ayya_admin_approvals_v1';
const APPROVALS_REFRESH_STALE_MS = 30_000;

type AdminApprovalsContextValue = {
  isReady: boolean;
  items: AdminApprovalRecord[];
  updateStatus: (id: string, status: AdminApprovalRecord['status']) => Promise<void>;
  refresh: (options?: { force?: boolean }) => Promise<void>;
};

const AdminApprovalsContext = createContext<AdminApprovalsContextValue | null>(null);

async function readCachedApprovals(): Promise<AdminApprovalRecord[] | null> {
  const raw = await AsyncStorage.getItem(ADMIN_APPROVALS_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AdminApprovalRecord[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function AdminApprovalsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isReady: authReady } = useAdminAuth();
  const [isReady, setIsReady] = useState(false);
  const [items, setItems] = useState<AdminApprovalRecord[]>([]);
  const lastRefreshAtRef = useRef(0);

  const refresh = useCallback(async (options?: { force?: boolean }) => {
    const force = options?.force ?? false;
    const now = Date.now();
    if (!force && items.length > 0 && now - lastRefreshAtRef.current < APPROVALS_REFRESH_STALE_MS) {
      setIsReady(true);
      return;
    }

    const cached = await readCachedApprovals();
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
      const remote = await listApprovals();
      setItems(remote);
      lastRefreshAtRef.current = Date.now();
      if (remote.length > 0) {
        await AsyncStorage.setItem(ADMIN_APPROVALS_KEY, JSON.stringify(remote));
      }
    } catch {
      if (!cached || cached.length === 0) {
        const fallback = await readCachedApprovals();
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

  const updateStatus = useCallback(
    async (id: string, status: AdminApprovalRecord['status']) => {
      await updateApprovalStatus(id, status).catch(() => undefined);

      setItems((current) => {
        const next = current.map((item) => (item.id === id ? { ...item, status } : item));
        void AsyncStorage.setItem(ADMIN_APPROVALS_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({ isReady, items, updateStatus, refresh }),
    [isReady, items, updateStatus, refresh],
  );

  return (
    <AdminApprovalsContext.Provider value={value}>{children}</AdminApprovalsContext.Provider>
  );
}

export function useAdminApprovals() {
  const context = useContext(AdminApprovalsContext);
  if (!context) {
    throw new Error('useAdminApprovals must be used within AdminApprovalsProvider');
  }
  return context;
}
