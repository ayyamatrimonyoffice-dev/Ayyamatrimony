import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { ChatMessage, ChatThread } from '@/context/ChatContext';
import { getFirebaseFirestore } from '@/lib/firebase';
import {
  chatDocId,
  FIRESTORE_COLLECTIONS,
  type FirestoreChatDoc,
  type FirestoreChatMessageDoc,
} from '@/lib/firestore/collections';

function threadFromDoc(chat: FirestoreChatDoc, messages: ChatMessage[], viewerPhone: string): ChatThread {
  const unreadCount = chat.unreadByPhone?.[viewerPhone.replace(/\D/g, '')] ?? 0;
  return {
    memberId: chat.memberId,
    memberName: chat.memberName,
    memberImage: chat.memberImage,
    messages,
    unreadCount,
  };
}

function messageFromDoc(entry: FirestoreChatMessageDoc, viewerPhone: string): ChatMessage {
  const viewerDigits = viewerPhone.replace(/\D/g, '');
  const isMine = entry.senderPhone === viewerDigits;
  return {
    id: entry.messageId,
    text: entry.text,
    sender: isMine ? 'me' : 'them',
    createdAt: entry.createdAt,
  };
}

export async function listChatThreads(viewerPhone: string): Promise<ChatThread[]> {
  const db = await getFirebaseFirestore();
  const digits = viewerPhone.replace(/\D/g, '');
  if (!db || !digits) {
    return [];
  }

  const snapshot = await getDocs(
    query(collection(db, FIRESTORE_COLLECTIONS.chats), where('participantPhones', 'array-contains', digits)),
  );

  const threads = await Promise.all(
    snapshot.docs.map(async (entry) => {
      const chat = entry.data() as FirestoreChatDoc;
      const messagesSnapshot = await getDocs(
        query(
          collection(db, FIRESTORE_COLLECTIONS.chats, chat.chatId, FIRESTORE_COLLECTIONS.chatMessages),
          orderBy('createdAt', 'asc'),
        ),
      );
      const messages = messagesSnapshot.docs.map((message) =>
        messageFromDoc(message.data() as FirestoreChatMessageDoc, viewerPhone),
      );
      return threadFromDoc(chat, messages, viewerPhone);
    }),
  );

  return threads;
}

export async function ensureChatThread(
  viewerPhone: string,
  viewerProfileId: string,
  memberId: string,
  memberName: string,
  memberImage: string,
  memberPhone = '',
): Promise<ChatThread | null> {
  const db = await getFirebaseFirestore();
  const viewerDigits = viewerPhone.replace(/\D/g, '');
  const peerDigits = memberPhone.replace(/\D/g, '') || memberId;
  const id = chatDocId(viewerDigits, peerDigits) || `chat_${viewerDigits}_${memberId}`;
  if (!db || !viewerDigits) {
    return null;
  }

  const chatRef = doc(db, FIRESTORE_COLLECTIONS.chats, id);
  const existing = await getDoc(chatRef);
  if (!existing.exists()) {
    const payload: FirestoreChatDoc = {
      chatId: id,
      participantPhones: [viewerDigits, peerDigits].filter(Boolean),
      participantProfileIds: [viewerProfileId, memberId].filter(Boolean),
      memberId,
      memberName,
      memberImage,
      lastMessage: '',
      lastMessageAt: Date.now(),
      unreadByPhone: {},
      updatedAt: Date.now(),
    };
    await setDoc(chatRef, payload);
  }

  const messagesSnapshot = await getDocs(
    query(
      collection(db, FIRESTORE_COLLECTIONS.chats, id, FIRESTORE_COLLECTIONS.chatMessages),
      orderBy('createdAt', 'asc'),
    ),
  );
  const messages = messagesSnapshot.docs.map((message) =>
    messageFromDoc(message.data() as FirestoreChatMessageDoc, viewerPhone),
  );
  const chat = (existing.exists() ? existing.data() : null) as FirestoreChatDoc | null;
  if (!chat) {
    return {
      memberId,
      memberName,
      memberImage,
      messages,
      unreadCount: 0,
    };
  }

  return threadFromDoc(chat, messages, viewerPhone);
}

export async function sendChatMessage(
  viewerPhone: string,
  memberId: string,
  memberPhone: string,
  text: string,
): Promise<void> {
  const db = await getFirebaseFirestore();
  const viewerDigits = viewerPhone.replace(/\D/g, '');
  const peerDigits = memberPhone.replace(/\D/g, '') || memberId;
  const id = chatDocId(viewerDigits, peerDigits) || `chat_${viewerDigits}_${memberId}`;
  if (!db || !viewerDigits || !text.trim()) {
    return;
  }

  const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const message: FirestoreChatMessageDoc = {
    messageId,
    senderPhone: viewerDigits,
    sender: 'me',
    text: text.trim(),
    createdAt: Date.now(),
  };

  await setDoc(
    doc(db, FIRESTORE_COLLECTIONS.chats, id, FIRESTORE_COLLECTIONS.chatMessages, messageId),
    message,
  );

  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.chats, id), {
    lastMessage: message.text,
    lastMessageAt: message.createdAt,
    updatedAt: Date.now(),
    [`unreadByPhone.${peerDigits}`]: 1,
  });
}

export async function markChatRead(viewerPhone: string, memberId: string, memberPhone = ''): Promise<void> {
  const db = await getFirebaseFirestore();
  const viewerDigits = viewerPhone.replace(/\D/g, '');
  const peerDigits = memberPhone.replace(/\D/g, '') || memberId;
  const id = chatDocId(viewerDigits, peerDigits) || `chat_${viewerDigits}_${memberId}`;
  if (!db || !viewerDigits) {
    return;
  }

  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.chats, id), {
    [`unreadByPhone.${viewerDigits}`]: 0,
    updatedAt: Date.now(),
  });
}
