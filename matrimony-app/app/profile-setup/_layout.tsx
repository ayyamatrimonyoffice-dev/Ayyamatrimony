import { Stack } from 'expo-router';
import { ProfileFormProvider } from '@/context/ProfileFormContext';

export default function ProfileSetupLayout() {
  return (
    <ProfileFormProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="[step]" />
      </Stack>
    </ProfileFormProvider>
  );
}
