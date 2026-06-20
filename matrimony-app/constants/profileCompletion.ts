export function hasSavedBiodata(values: Record<string, string>): boolean {
  return Boolean(
    values.dateOfBirth?.trim() &&
      (values.fatherName?.trim() || values.motherName?.trim()),
  );
}

export function hasCompletedProfile(values: Record<string, string>): boolean {
  const hasName = Boolean(values.fullName?.trim());
  const hasCommunity = Boolean(values.registrationCommunity?.trim());

  if (!hasName || !hasCommunity) {
    return false;
  }

  if (values.gender === 'male' || values.gender === 'female') {
    return true;
  }

  // Returning users who completed biodata before gender was added.
  return hasSavedBiodata(values);
}

export type AuthRedirectPath = '/' | '/select-community' | '/(tabs)';

export function getAuthRedirectPath(
  isLoggedIn: boolean,
  values: Record<string, string>,
): AuthRedirectPath {
  if (!isLoggedIn) return '/';
  if (!hasCompletedProfile(values)) return '/select-community';
  return '/(tabs)';
}