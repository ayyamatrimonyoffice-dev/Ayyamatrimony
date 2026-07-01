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
import type { FirestoreProfileDoc } from '@/lib/firestore/collections';
import { buildPhotoApprovalSlotsByPhone, listAllProfiles } from '@/lib/firestore/profileService';

const PROFILES_REFRESH_STALE_MS = 30_000;

type AdminProfilesContextValue = {
  isReady: boolean;
  profiles: FirestoreProfileDoc[];
  approvalSlotsByPhone: Map<string, string[]>;
  refresh: (options?: { force?: boolean }) => Promise<void>;
};

const AdminProfilesContext = createContext<AdminProfilesContextValue | null>(null);

function filterPublishedProfiles(entries: FirestoreProfileDoc[]): FirestoreProfileDoc[] {
  return entries.filter(
    (profile) =>
      profile.published &&
      profile.accountStatus !== 'blocked' &&
      profile.accountStatus !== 'deleted' &&
      profile.approvalStatus !== 'rejected',
  );
}

export function AdminProfilesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isReady: authReady } = useAdminAuth();
  const [isReady, setIsReady] = useState(false);
  const [profiles, setProfiles] = useState<FirestoreProfileDoc[]>([]);
  const [approvalSlotsByPhone, setApprovalSlotsByPhone] = useState<Map<string, string[]>>(
    () => new Map(),
  );
  const lastRefreshAtRef = useRef(0);

  const refresh = useCallback(async (options?: { force?: boolean }) => {
    const force = options?.force ?? false;
    const now = Date.now();
    if (!force && profiles.length > 0 && now - lastRefreshAtRef.current < PROFILES_REFRESH_STALE_MS) {
      setIsReady(true);
      return;
    }

    const db = await getFirebaseFirestore();
    if (!db) {
      setIsReady(true);
      return;
    }

    try {
      const [entries, approvalSlots] = await Promise.all([
        listAllProfiles(),
        buildPhotoApprovalSlotsByPhone(),
      ]);
      setApprovalSlotsByPhone(approvalSlots);
      setProfiles(filterPublishedProfiles(entries));
      lastRefreshAtRef.current = Date.now();
    } catch {
      // Keep the last loaded list when Firestore is temporarily unavailable.
    } finally {
      setIsReady(true);
    }
  }, [profiles.length]);

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      return;
    }
    void refresh({ force: true });
  }, [authReady, isAuthenticated, refresh]);

  const value = useMemo(
    () => ({ isReady, profiles, approvalSlotsByPhone, refresh }),
    [approvalSlotsByPhone, isReady, profiles, refresh],
  );

  return (
    <AdminProfilesContext.Provider value={value}>{children}</AdminProfilesContext.Provider>
  );
}

export function useAdminProfiles() {
  const context = useContext(AdminProfilesContext);
  if (!context) {
    throw new Error('useAdminProfiles must be used within AdminProfilesProvider');
  }
  return context;
}
