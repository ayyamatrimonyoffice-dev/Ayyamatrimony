import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CONTACT_PHONE_KEY, normalizePhoneDigits } from '@/constants/contactDetails';
import { useProfileForm } from '@/context/ProfileFormContext';
import { listSentInterests, saveSentInterest } from '@/lib/firestore/interestService';
import { profileDocIdFromPhone } from '@/lib/firestore/collections';

const LEGACY_MATCH_ACTIONS_STORAGE_KEY = 'match_actions';

export type SentInterestStatus = 'pending' | 'accepted' | 'declined';

export type SentInterest = {
  memberId: string;
  memberName: string;
  memberImage: string;
  age: string;
  community: string;
  location: string;
  sentAt: string;
  status: SentInterestStatus;
};

type MatchActionsState = {
  shortlistedIds: string[];
  sentInterests: SentInterest[];
};

type MatchActionsContextValue = {
  isReady: boolean;
  shortlistedIds: string[];
  sentInterests: SentInterest[];
  isShortlisted: (memberId: string) => boolean;
  hasSentInterest: (memberId: string) => boolean;
  toggleShortlist: (memberId: string) => Promise<'added' | 'removed'>;
  sendInterest: (interest: Omit<SentInterest, 'sentAt' | 'status'>) => Promise<'sent' | 'exists'>;
  clearActions: () => Promise<void>;
};

const defaultState: MatchActionsState = {
  shortlistedIds: [],
  sentInterests: [],
};

const MatchActionsContext = createContext<MatchActionsContextValue | null>(null);

function getMatchActionsStorageKey(phone: string) {
  const digits = normalizePhoneDigits(phone);
  return digits ? `match_actions:${digits}` : 'match_actions:guest';
}

function parseStoredState(raw: string | null): MatchActionsState {
  if (!raw) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MatchActionsState>;
    return {
      shortlistedIds: Array.isArray(parsed.shortlistedIds)
        ? parsed.shortlistedIds.filter((id): id is string => typeof id === 'string')
        : [],
      sentInterests: Array.isArray(parsed.sentInterests)
        ? parsed.sentInterests.filter(
            (entry): entry is SentInterest =>
              Boolean(entry?.memberId && typeof entry.memberName === 'string'),
          )
        : [],
    };
  } catch {
    return defaultState;
  }
}

function formatInterestDate(date: Date) {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  });
}

function MatchActionsProviderInner({ children }: { children: ReactNode }) {
  const { values, isReady: isProfileReady } = useProfileForm();
  const ownerPhone = normalizePhoneDigits(values[CONTACT_PHONE_KEY] ?? values.phoneNumber ?? '');
  const storageKey = getMatchActionsStorageKey(ownerPhone);
  const storageKeyRef = useRef(storageKey);
  storageKeyRef.current = storageKey;

  const [state, setState] = useState<MatchActionsState>(defaultState);
  const [isReady, setIsReady] = useState(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!isProfileReady) {
      return;
    }

    let cancelled = false;

    AsyncStorage.getItem(storageKey)
      .then(async (stored) => {
        if (cancelled) {
          return;
        }

        const localState = parseStoredState(stored);
        const remoteInterests = ownerPhone ? await listSentInterests(ownerPhone).catch(() => []) : [];
        if (remoteInterests.length > 0) {
          setState({
            ...localState,
            sentInterests: remoteInterests,
          });
          void AsyncStorage.setItem(storageKey, JSON.stringify({
            ...localState,
            sentInterests: remoteInterests,
          }));
          return;
        }

        setState(localState);
      })
      .finally(() => {
        if (!cancelled && !hasInitializedRef.current) {
          hasInitializedRef.current = true;
          setIsReady(true);
        }
      });

    void AsyncStorage.removeItem(LEGACY_MATCH_ACTIONS_STORAGE_KEY);

    return () => {
      cancelled = true;
    };
  }, [isProfileReady, storageKey]);

  const persistState = useCallback((nextState: MatchActionsState) => {
    void AsyncStorage.setItem(storageKeyRef.current, JSON.stringify(nextState));
  }, []);

  const isShortlisted = useCallback(
    (memberId: string) => state.shortlistedIds.includes(memberId),
    [state.shortlistedIds],
  );

  const hasSentInterest = useCallback(
    (memberId: string) => state.sentInterests.some((entry) => entry.memberId === memberId),
    [state.sentInterests],
  );

  const toggleShortlist = useCallback(
    async (memberId: string) => {
      let result: 'added' | 'removed' = 'added';

      setState((current) => {
        const alreadyListed = current.shortlistedIds.includes(memberId);
        result = alreadyListed ? 'removed' : 'added';
        const nextState: MatchActionsState = {
          ...current,
          shortlistedIds: alreadyListed
            ? current.shortlistedIds.filter((id) => id !== memberId)
            : [...current.shortlistedIds, memberId],
        };
        persistState(nextState);
        return nextState;
      });

      return result;
    },
    [persistState],
  );

  const sendInterest = useCallback(
    async (interest: Omit<SentInterest, 'sentAt' | 'status'>) => {
      let result: 'sent' | 'exists' = 'sent';
      let savedInterest: SentInterest | null = null;

      setState((current) => {
        if (current.sentInterests.some((entry) => entry.memberId === interest.memberId)) {
          result = 'exists';
          return current;
        }

        savedInterest = {
          ...interest,
          sentAt: formatInterestDate(new Date()),
          status: 'pending',
        };

        const nextState: MatchActionsState = {
          ...current,
          sentInterests: [...current.sentInterests, savedInterest],
        };
        persistState(nextState);
        return nextState;
      });

      if (savedInterest && ownerPhone) {
        void saveSentInterest(
          ownerPhone,
          profileDocIdFromPhone(ownerPhone),
          savedInterest,
        ).catch(() => undefined);
      }

      return result;
    },
    [ownerPhone, persistState],
  );

  const clearActions = useCallback(async () => {
    const keysToClear = new Set([
      storageKeyRef.current,
      getMatchActionsStorageKey(''),
      LEGACY_MATCH_ACTIONS_STORAGE_KEY,
    ]);
    setState(defaultState);
    await AsyncStorage.multiRemove([...keysToClear]);
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      shortlistedIds: state.shortlistedIds,
      sentInterests: state.sentInterests,
      isShortlisted,
      hasSentInterest,
      toggleShortlist,
      sendInterest,
      clearActions,
    }),
    [
      clearActions,
      hasSentInterest,
      isReady,
      isShortlisted,
      sendInterest,
      state.sentInterests,
      state.shortlistedIds,
      toggleShortlist,
    ],
  );

  return <MatchActionsContext.Provider value={value}>{children}</MatchActionsContext.Provider>;
}

export function MatchActionsProvider({ children }: { children: ReactNode }) {
  return <MatchActionsProviderInner>{children}</MatchActionsProviderInner>;
}

export function useMatchActions() {
  const context = useContext(MatchActionsContext);
  if (!context) {
    throw new Error('useMatchActions must be used within MatchActionsProvider');
  }
  return context;
}
