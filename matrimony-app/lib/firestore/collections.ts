import type { MatchGender } from '@/constants/matchFilters';
import type { SentInterestStatus } from '@/context/MatchActionsContext';

/** Top-level Firestore collection names (optimized for query patterns). */
export const FIRESTORE_COLLECTIONS = {
  profiles: 'profiles',
  interests: 'interests',
  matches: 'matches',
  chats: 'chats',
  chatMessages: 'messages',
  vendors: 'vendors',
  approvals: 'approvals',
} as const;

export type FirestoreProfileDoc = {
  profileId: string;
  phone: string;
  ownerKey: string;
  biodata: Record<string, string>;
  photoUrls: string[];
  primaryPhotoUrl: string;
  registrationCommunity: string;
  gender: MatchGender | '';
  fullName: string;
  published: boolean;
  approvalStatus?: FirestoreApprovalDoc['status'];
  listing: {
    id: string;
    name: string;
    age: string;
    community: string;
    location: string;
    image: string;
    gender: MatchGender;
    phoneNumber: string;
    verified: boolean;
  };
  createdAt: number;
  updatedAt: number;
};

export type FirestoreInterestDoc = {
  interestId: string;
  fromPhone: string;
  fromProfileId: string;
  toProfileId: string;
  status: SentInterestStatus;
  memberName: string;
  memberImage: string;
  age: string;
  community: string;
  location: string;
  sentAt: number;
};

export type FirestoreMatchDoc = {
  matchId: string;
  profileIdA: string;
  profileIdB: string;
  phoneA: string;
  phoneB: string;
  matchedAt: number;
  status: 'active' | 'closed';
};

export type FirestoreChatDoc = {
  chatId: string;
  participantPhones: string[];
  participantProfileIds: string[];
  memberId: string;
  memberName: string;
  memberImage: string;
  lastMessage: string;
  lastMessageAt: number;
  unreadByPhone: Record<string, number>;
  updatedAt: number;
};

export type FirestoreChatMessageDoc = {
  messageId: string;
  senderPhone: string;
  sender: 'me' | 'them';
  text: string;
  createdAt: number;
};

export type VendorCategory =
  | 'photography'
  | 'catering'
  | 'decoration'
  | 'music'
  | 'venue'
  | 'other';

export type FirestoreVendorDoc = {
  vendorId: string;
  name: string;
  category: VendorCategory;
  phone: string;
  whatsappNumber?: string;
  location: string;
  description: string;
  imageUrl: string;
  registrationCommunity?: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

export type FirestoreApprovalDoc = {
  approvalId: string;
  phone: string;
  name: string;
  profileId?: string;
  registrationCommunity?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
  updatedAt: number;
  source: 'login' | 'profile';
};

export function profileDocIdFromPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits ? `phone_${digits}` : '';
}

export function chatDocId(phoneA: string, phoneB: string): string {
  const sorted = [phoneA.replace(/\D/g, ''), phoneB.replace(/\D/g, '')].filter(Boolean).sort();
  return sorted.length === 2 ? `chat_${sorted[0]}_${sorted[1]}` : '';
}

export function interestDocId(fromPhone: string, toProfileId: string): string {
  const digits = fromPhone.replace(/\D/g, '');
  return `interest_${digits}_${toProfileId}`;
}

export function approvalDocIdFromPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits ? `phone_${digits}` : '';
}
