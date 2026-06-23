import type { FirestoreProfileDoc } from '@/lib/firestore/collections';
import { isChristianRegistration } from '@/constants/registrationCommunities';

export type MatchSuggestion = {
  profileId: string;
  phone: string;
  name: string;
  community: string;
  score: number;
  reasons: string[];
  image: string;
};

const RASI_COMPAT: Record<string, string[]> = {
  mesham: ['mesham', 'simmam', 'dhanusu', 'mithunam'],
  rishabam: ['rishabam', 'kanni', 'makaram', 'katakam'],
  mithunam: ['mithunam', 'thulam', 'kumbam', 'mesham'],
  katakam: ['katakam', 'vrichigam', 'meenam', 'rishabam'],
  simmam: ['simmam', 'dhanusu', 'mesham', 'thulam'],
  kanni: ['kanni', 'makaram', 'rishabam', 'vrichigam'],
  thulam: ['thulam', 'kumbam', 'mithunam', 'simmam'],
  vrichigam: ['vrichigam', 'meenam', 'katakam', 'kanni'],
  dhanusu: ['dhanusu', 'mesham', 'simmam', 'makaram'],
  makaram: ['makaram', 'rishabam', 'kanni', 'dhanusu'],
  kumbam: ['kumbam', 'mithunam', 'thulam', 'meenam'],
  meenam: ['meenam', 'katakam', 'vrichigam', 'kumbam'],
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

function ageFromDob(dob: string): number | null {
  const year = dob.match(/(\d{4})/)?.[1];
  if (!year) return null;
  return new Date().getFullYear() - Number(year);
}

function scoreAgeCompatibility(leftDob: string, rightDob: string): { score: number; reason?: string } {
  const leftAge = ageFromDob(leftDob);
  const rightAge = ageFromDob(rightDob);
  if (leftAge == null || rightAge == null) {
    return { score: 5 };
  }

  const gap = Math.abs(leftAge - rightAge);
  if (gap <= 3) return { score: 15, reason: 'Age gap within 3 years' };
  if (gap <= 6) return { score: 10, reason: 'Age gap within 6 years' };
  if (gap <= 10) return { score: 5, reason: 'Age gap within 10 years' };
  return { score: 0 };
}

function scoreRasiCompatibility(leftRasi: string, rightRasi: string): { score: number; reason?: string } {
  const a = normalizeKey(leftRasi);
  const b = normalizeKey(rightRasi);
  if (!a || !b) return { score: 0 };

  if (a === b) {
    return { score: 20, reason: 'Same rasi match' };
  }

  const compatible = RASI_COMPAT[a] ?? [];
  if (compatible.includes(b)) {
    return { score: 15, reason: 'Compatible rasi pair' };
  }

  return { score: 5, reason: 'Rasi needs review' };
}

function scoreNakshatra(left: string, right: string): { score: number; reason?: string } {
  const a = normalizeKey(left);
  const b = normalizeKey(right);
  if (!a || !b) return { score: 0 };
  if (a === b) return { score: 10, reason: 'Same nakshatra' };
  return { score: 8, reason: 'Nakshatra pair noted' };
}

function scoreChristianMatch(
  source: FirestoreProfileDoc,
  candidate: FirestoreProfileDoc,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  if (source.registrationCommunity === candidate.registrationCommunity) {
    score += 30;
    reasons.push('Same Christian community');
  } else if (
    isChristianRegistration(source.registrationCommunity) &&
    isChristianRegistration(candidate.registrationCommunity)
  ) {
    score += 15;
    reasons.push('Christian denomination pair');
  }

  const age = scoreAgeCompatibility(
    source.biodata.dateOfBirth ?? '',
    candidate.biodata.dateOfBirth ?? '',
  );
  score += age.score;
  if (age.reason) reasons.push(age.reason);

  const leftPlace = source.biodata.nativePlace ?? source.biodata.irupidam ?? '';
  const rightPlace = candidate.biodata.nativePlace ?? candidate.biodata.irupidam ?? '';
  if (leftPlace && rightPlace && normalizeKey(leftPlace) === normalizeKey(rightPlace)) {
    score += 15;
    reasons.push('Same native place');
  } else if (leftPlace && rightPlace) {
    score += 8;
    reasons.push('Location overlap');
  }

  if (source.biodata.education && source.biodata.education === candidate.biodata.education) {
    score += 10;
    reasons.push('Same education level');
  }

  if (source.biodata.occupation && source.biodata.occupation === candidate.biodata.occupation) {
    score += 8;
    reasons.push('Similar occupation');
  }

  return { score: Math.min(score, 100), reasons };
}

function scoreHinduHoroscopeMatch(
  source: FirestoreProfileDoc,
  candidate: FirestoreProfileDoc,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  const rasi = scoreRasiCompatibility(source.biodata.rasi ?? '', candidate.biodata.rasi ?? '');
  score += rasi.score;
  if (rasi.reason) reasons.push(rasi.reason);

  const nak = scoreNakshatra(source.biodata.natchathiram ?? '', candidate.biodata.natchathiram ?? '');
  score += nak.score;
  if (nak.reason) reasons.push(nak.reason);

  const age = scoreAgeCompatibility(
    source.biodata.dateOfBirth ?? '',
    candidate.biodata.dateOfBirth ?? '',
  );
  score += age.score;
  if (age.reason) reasons.push(age.reason);

  if (source.registrationCommunity === candidate.registrationCommunity) {
    score += 15;
    reasons.push('Same Hindu community');
  }

  const leftPlace = source.biodata.nativePlace ?? source.biodata.irupidam ?? '';
  const rightPlace = candidate.biodata.nativePlace ?? candidate.biodata.irupidam ?? '';
  if (leftPlace && rightPlace) {
    score += 10;
    reasons.push('Location considered');
  }

  return { score: Math.min(score, 100), reasons };
}

export function computeMatchScore(
  source: FirestoreProfileDoc,
  candidate: FirestoreProfileDoc,
): MatchSuggestion {
  const isChristian = isChristianRegistration(
    source.registrationCommunity,
    source.biodata.religion ?? '',
  );

  const result = isChristian
    ? scoreChristianMatch(source, candidate)
    : scoreHinduHoroscopeMatch(source, candidate);

  return {
    profileId: candidate.profileId,
    phone: candidate.phone,
    name: candidate.fullName || candidate.listing.name,
    community: candidate.registrationCommunity || candidate.listing.community,
    score: result.score,
    reasons: result.reasons,
    image: candidate.primaryPhotoUrl || candidate.listing.image,
  };
}

export function rankMatchesForProfile(
  source: FirestoreProfileDoc,
  candidates: FirestoreProfileDoc[],
  limit = 10,
): MatchSuggestion[] {
  const sourceGender = source.gender || source.listing.gender;
  const oppositeGender = sourceGender === 'male' ? 'female' : sourceGender === 'female' ? 'male' : '';

  return candidates
    .filter((candidate) => {
      if (candidate.phone === source.phone) return false;
      if (candidate.accountStatus === 'blocked' || candidate.accountStatus === 'deleted') return false;
      if (!candidate.published) return false;
      if (candidate.approvalStatus === 'rejected') return false;
      if (oppositeGender) {
        const gender = candidate.gender || candidate.listing.gender;
        if (gender !== oppositeGender) return false;
      }
      return true;
    })
    .map((candidate) => computeMatchScore(source, candidate))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}
