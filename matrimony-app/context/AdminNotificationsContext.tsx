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
import { adminNotifications, type AdminNotificationRecord } from '@/constants/adminMockData';

const ADMIN_NOTIFICATIONS_KEY = 'ayya_admin_notifications_v1';

type AdminNotificationsContextValue = {
  isReady: boolean;
  items: AdminNotificationRecord[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};

const AdminNotificationsContext = createContext<AdminNotificationsContextValue | null>(null);

async function readStoredNotifications(): Promise<AdminNotificationRecord[] | null> {
  const raw = await AsyncStorage.getItem(ADMIN_NOTIFICATIONS_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AdminNotificationRecord[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function mergeWithDefaults(
  stored: AdminNotificationRecord[] | null,
  defaults: AdminNotificationRecord[],
): AdminNotificationRecord[] {
  if (!stored?.length) {
    return defaults;
  }

  const storedById = new Map(stored.map((item) => [item.id, item]));
  const defaultIds = new Set(defaults.map((item) => item.id));

  const merged = defaults.map((item) => {
    const saved = storedById.get(item.id);
    return saved ? { ...item, read: saved.read } : item;
  });

  for (const item of stored) {
    if (!defaultIds.has(item.id)) {
      merged.push(item);
    }
  }

  return merged;
}

async function persistNotifications(items: AdminNotificationRecord[]): Promise<void> {
  await AsyncStorage.setItem(ADMIN_NOTIFICATIONS_KEY, JSON.stringify(items));
}

export function AdminNotificationsProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [items, setItems] = useState<AdminNotificationRecord[]>(adminNotifications);

  useEffect(() => {
    void (async () => {
      const stored = await readStoredNotifications();
      const merged = mergeWithDefaults(stored, adminNotifications);
      setItems(merged);
      setIsReady(true);
    })();
  }, []);

  const markRead = useCallback(
    async (id: string) => {
      setItems((current) => {
        const next = current.map((item) => (item.id === id ? { ...item, read: true } : item));
        void persistNotifications(next);
        return next;
      });
    },
    [],
  );

  const markAllRead = useCallback(async () => {
    setItems((current) => {
      const next = current.map((item) => ({ ...item, read: true }));
      void persistNotifications(next);
      return next;
    });
  }, []);

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

  const value = useMemo(
    () => ({ isReady, items, unreadCount, markRead, markAllRead }),
    [isReady, items, unreadCount, markRead, markAllRead],
  );

  return (
    <AdminNotificationsContext.Provider value={value}>{children}</AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications() {
  const context = useContext(AdminNotificationsContext);
  if (!context) {
    throw new Error('useAdminNotifications must be used within AdminNotificationsProvider');
  }
  return context;
}
