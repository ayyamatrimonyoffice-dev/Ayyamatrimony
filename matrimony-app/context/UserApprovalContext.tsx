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
import { CONTACT_PHONE_KEY } from '@/constants/contactDetails';
import { useProfileForm } from '@/context/ProfileFormContext';
import { useSubscription } from '@/context/SubscriptionContext';
import type { FirestoreApprovalDoc } from '@/lib/firestore/collections';
import { canUserBrowseProfiles, fetchUserApprovalStatus, resolveUserApprovalStatus } from '@/lib/firestore/approvalService';

const USER_APPROVAL_CACHE_KEY = 'ayya_user_approval_status_v1';

type ApprovalStatus = FirestoreApprovalDoc['status'] | null;

type CachedApproval = {
  phone: string;
  status: ApprovalStatus;
};

type UserApprovalContextValue = {
  isReady: boolean;
  approvalStatus: ApprovalStatus;
  canBrowseProfiles: boolean;
  refresh: () => Promise<void>;
};

const UserApprovalContext = createContext<UserApprovalContextValue | null>(null);

async function readCachedApproval(phone: string): Promise<ApprovalStatus | null> {
  const raw = await AsyncStorage.getItem(USER_APPROVAL_CACHE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as CachedApproval;
    return parsed.phone === phone ? parsed.status : null;
  } catch {
    return null;
  }
}

async function writeCachedApproval(phone: string, status: ApprovalStatus): Promise<void> {
  await AsyncStorage.setItem(
    USER_APPROVAL_CACHE_KEY,
    JSON.stringify({ phone, status } satisfies CachedApproval),
  );
}

export function UserApprovalProvider({ children }: { children: ReactNode }) {
  const { values, setValue } = useProfileForm();
  const { isLoggedIn } = useSubscription();
  const phone = values[CONTACT_PHONE_KEY]?.replace(/\D/g, '') ?? '';
  const profileApprovalStatus = values.approvalStatus ?? '';
  const [isReady, setIsReady] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>(null);

  const refresh = useCallback(async () => {
    if (!isLoggedIn || !phone) {
      setApprovalStatus(null);
      setIsReady(true);
      return;
    }

    const cachedStatus = await readCachedApproval(phone);
    const profileStatus =
      profileApprovalStatus === 'approved' ||
      profileApprovalStatus === 'pending' ||
      profileApprovalStatus === 'rejected'
        ? profileApprovalStatus
        : null;

    try {
      const remoteStatus = await fetchUserApprovalStatus(phone);
      const resolvedStatus = resolveUserApprovalStatus(remoteStatus, profileStatus, cachedStatus);
      setApprovalStatus(resolvedStatus);

      if (resolvedStatus && resolvedStatus !== profileStatus) {
        setValue('approvalStatus', resolvedStatus);
      }

      await writeCachedApproval(phone, resolvedStatus);
    } catch {
      const resolvedStatus = resolveUserApprovalStatus(profileStatus, cachedStatus);
      setApprovalStatus(resolvedStatus);
    } finally {
      setIsReady(true);
    }
  }, [isLoggedIn, phone, profileApprovalStatus, setValue]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const canBrowseProfiles = canUserBrowseProfiles(
    resolveUserApprovalStatus(approvalStatus, profileApprovalStatus),
  );

  const value = useMemo(
    () => ({
      isReady,
      approvalStatus: resolveUserApprovalStatus(approvalStatus, profileApprovalStatus),
      canBrowseProfiles,
      refresh,
    }),
    [approvalStatus, canBrowseProfiles, isReady, profileApprovalStatus, refresh],
  );

  return <UserApprovalContext.Provider value={value}>{children}</UserApprovalContext.Provider>;
}

export function useUserApproval() {
  const context = useContext(UserApprovalContext);
  if (!context) {
    throw new Error('useUserApproval must be used within UserApprovalProvider');
  }
  return context;
}
