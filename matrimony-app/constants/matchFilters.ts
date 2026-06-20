export type MatchGender = 'male' | 'female';

export function resolveUserGender(values: Record<string, string>): MatchGender | '' {
  const gender = values.gender?.trim();
  if (gender === 'male' || gender === 'female') {
    return gender;
  }
  return '';
}

export function getRecommendedGender(userGender: string): MatchGender | null {  if (userGender === 'male') {
    return 'female';
  }
  if (userGender === 'female') {
    return 'male';
  }
  return null;
}

export function filterByRecommendedGender<T extends { gender: MatchGender }>(
  profiles: readonly T[],
  userGender: string,
): T[] {
  const recommendedGender = getRecommendedGender(userGender);
  if (!recommendedGender) {
    return [];
  }
  return profiles.filter((profile) => profile.gender === recommendedGender);
}
