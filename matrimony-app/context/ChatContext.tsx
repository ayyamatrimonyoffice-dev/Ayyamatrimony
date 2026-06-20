import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { CONTACT_PHONE_KEY, normalizePhoneDigits } from '@/constants/contactDetails';
import { useProfileForm } from '@/context/ProfileFormContext';
import {
  ensureChatThread,
  listChatThreads,
  markChatRead,
  sendChatMessage,
} from '@/lib/firestore/chatService';
import { profileDocIdFromPhone } from '@/lib/firestore/collections';

const CHAT_STORAGE_KEY = 'chat_threads';

export type ChatMessage = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  createdAt: number;
};

export type ChatThread = {
  memberId: string;
  memberName: string;
  memberImage: string;
  messages: ChatMessage[];
  unreadCount: number;
};

type ChatContextValue = {
  isReady: boolean;
  threads: ChatThread[];
  getThread: (memberId: string) => ChatThread | undefined;
  ensureThread: (
    memberId: string,
    memberName: string,
    memberImage: string,
    seedMessage?: string,
  ) => Promise<ChatThread>;
  sendMessage: (memberId: string, text: string) => Promise<void>;
  markThreadRead: (memberId: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

function parseStoredThreads(raw: string | null): ChatThread[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ChatThread[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (thread): thread is ChatThread =>
        Boolean(thread?.memberId && Array.isArray(thread.messages)),
    );
  } catch {
    return [];
  }
}

function createMessage(text: string, sender: 'me' | 'them'): ChatMessage {
  return {
    id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    sender,
    createdAt: Date.now(),
  };
}

function ChatProviderInner({ children }: { children: ReactNode }) {
  const { values, isReady: profileReady } = useProfileForm();
  const viewerPhone = normalizePhoneDigits(values[CONTACT_PHONE_KEY] ?? values.phoneNumber ?? '');
  const viewerProfileId = profileDocIdFromPhone(viewerPhone);

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!profileReady) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const localRaw = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
      const localThreads = parseStoredThreads(localRaw);
      const remoteThreads = viewerPhone ? await listChatThreads(viewerPhone).catch(() => []) : [];
      const nextThreads = remoteThreads.length > 0 ? remoteThreads : localThreads;

      if (!cancelled) {
        setThreads(nextThreads);
        await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(nextThreads));
        setIsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profileReady, viewerPhone]);

  const updateThreads = useCallback((updater: (current: ChatThread[]) => ChatThread[]) => {
    setThreads((current) => {
      const next = updater(current);
      void AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const getThread = useCallback(
    (memberId: string) => threads.find((thread) => thread.memberId === memberId),
    [threads],
  );

  const ensureThread = useCallback(
    async (
      memberId: string,
      memberName: string,
      memberImage: string,
      seedMessage?: string,
    ): Promise<ChatThread> => {
      if (viewerPhone) {
        const remote = await ensureChatThread(
          viewerPhone,
          viewerProfileId,
          memberId,
          memberName,
          memberImage,
        );
        if (remote) {
          updateThreads((current) => {
            const existingIndex = current.findIndex((thread) => thread.memberId === memberId);
            if (existingIndex >= 0) {
              const next = [...current];
              next[existingIndex] = remote;
              return next;
            }
            return [...current, remote];
          });
          return remote;
        }
      }

      let resolvedThread: ChatThread | null = null;

      updateThreads((current) => {
        const existing = current.find((thread) => thread.memberId === memberId);
        if (existing) {
          resolvedThread = existing;
          return current;
        }

        const messages = seedMessage ? [createMessage(seedMessage, 'them')] : [];
        const nextThread: ChatThread = {
          memberId,
          memberName,
          memberImage,
          messages,
          unreadCount: seedMessage ? 1 : 0,
        };
        resolvedThread = nextThread;
        return [...current, nextThread];
      });

      if (!resolvedThread) {
        throw new Error('Unable to open chat thread');
      }

      return resolvedThread;
    },
    [updateThreads, viewerPhone, viewerProfileId],
  );

  const sendMessage = useCallback(
    async (memberId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }

      if (viewerPhone) {
        await sendChatMessage(viewerPhone, memberId, memberId, trimmed).catch(() => undefined);
      }

      updateThreads((current) => {
        const threadIndex = current.findIndex((thread) => thread.memberId === memberId);
        if (threadIndex < 0) {
          const nextThread: ChatThread = {
            memberId,
            memberName: memberId,
            memberImage: '',
            messages: [createMessage(trimmed, 'me')],
            unreadCount: 0,
          };
          return [...current, nextThread];
        }

        const thread = current[threadIndex];
        const nextThread: ChatThread = {
          ...thread,
          messages: [...thread.messages, createMessage(trimmed, 'me')],
        };

        const next = [...current];
        next[threadIndex] = nextThread;
        return next;
      });
    },
    [updateThreads, viewerPhone],
  );

  const markThreadRead = useCallback(
    async (memberId: string) => {
      if (viewerPhone) {
        await markChatRead(viewerPhone, memberId, memberId).catch(() => undefined);
      }

      updateThreads((current) => {
        const threadIndex = current.findIndex((thread) => thread.memberId === memberId);
        if (threadIndex < 0) {
          return current;
        }

        const thread = current[threadIndex];
        if (thread.unreadCount === 0) {
          return current;
        }

        const next = [...current];
        next[threadIndex] = { ...thread, unreadCount: 0 };
        return next;
      });
    },
    [updateThreads, viewerPhone],
  );

  const value = useMemo(
    () => ({
      isReady,
      threads,
      getThread,
      ensureThread,
      sendMessage,
      markThreadRead,
    }),
    [ensureThread, getThread, isReady, markThreadRead, sendMessage, threads],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  return <ChatProviderInner>{children}</ChatProviderInner>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}

export function getDefaultChatSeed(memberId: string): string | undefined {
  if (memberId === '1') {
    return 'preview-1';
  }
  if (memberId === '2' || memberId === '3') {
    return 'preview-2';
  }
  return undefined;
}
