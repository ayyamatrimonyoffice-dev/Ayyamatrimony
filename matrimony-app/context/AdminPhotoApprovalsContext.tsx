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
import {
  listPhotoApprovals,
  updatePhotoApprovalStatus,
  type AdminPhotoApprovalRecord,
} from '@/lib/firestore/photoApprovalService';

const ADMIN_PHOTO_APPROVALS_KEY = 'ayya_admin_photo_approvals_v1';
const PHOTO_APPROVALS_REFRESH_STALE_MS = 30_000;

type AdminPhotoApprovalsContextValue = {
  isReady: boolean;
  items: AdminPhotoApprovalRecord[];
  updateStatus: (
    id: string,
    status: 'approved' | 'rejected',
    options?: { rejectReason?: string },
  ) => Promise<void>;
  refresh: (options?: { force?: boolean }) => Promise<void>;
};

const AdminPhotoApprovalsContext = createContext<AdminPhotoApprovalsContextValue | null>(null);

async function readCachedPhotoApprovals(): Promise<AdminPhotoApprovalRecord[] | null> {
  const raw = await AsyncStorage.getItem(ADMIN_PHOTO_APPROVALS_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AdminPhotoApprovalRecord[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function AdminPhotoApprovalsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isReady: authReady } = useAdminAuth();
  const [isReady, setIsReady] = useState(false);
  const [items, setItems] = useState<AdminPhotoApprovalRecord[]>([]);
  const lastRefreshAtRef = useRef(0);

  const refresh = useCallback(async (options?: { force?: boolean }) => {
    const force = options?.force ?? false;
    const now = Date.now();
    if (!force && items.length > 0 && now - lastRefreshAtRef.current < PHOTO_APPROVALS_REFRESH_STALE_MS) {
      setIsReady(true);
      return;
    }

    const cached = await readCachedPhotoApprovals();
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
      const remote = await listPhotoApprovals();
      setItems(remote);
      lastRefreshAtRef.current = Date.now();
      await AsyncStorage.setItem(ADMIN_PHOTO_APPROVALS_KEY, JSON.stringify(remote));
    } catch {
      if (!cached || cached.length === 0) {
        const fallback = await readCachedPhotoApprovals();
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
    async (
      id: string,
      status: 'approved' | 'rejected',
      options: { rejectReason?: string } = {},
    ) => {
      await updatePhotoApprovalStatus(id, status, {
        reviewedBy: 'admin',
        rejectReason: options.rejectReason,
      }).catch(() => undefined);

      setItems((current) => {
        const next = current.map((item) => (item.id === id ? { ...item, status } : item));
        void AsyncStorage.setItem(ADMIN_PHOTO_APPROVALS_KEY, JSON.stringify(next));
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
    <AdminPhotoApprovalsContext.Provider value={value}>{children}</AdminPhotoApprovalsContext.Provider>
  );
}

export function useAdminPhotoApprovals() {
  const context = useContext(AdminPhotoApprovalsContext);
  if (!context) {
    throw new Error('useAdminPhotoApprovals must be used within AdminPhotoApprovalsProvider');
  }
  return context;
}
