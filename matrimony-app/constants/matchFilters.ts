export type MatchGender = 'male' | 'female';

export function getRecommendedGender(userGender: string): MatchGender | null {
  if (userGender === 'male') {
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
    return [...profiles];
  }
  return profiles.filter((profile) => profile.gender === recommendedGender);
}
