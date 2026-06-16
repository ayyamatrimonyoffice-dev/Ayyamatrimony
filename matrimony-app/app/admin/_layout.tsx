import { Stack } from 'expo-router';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { adminColors } from '@/constants/admin';

export default function AdminRootLayout() {
  return (
    <AdminAuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: adminColors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AdminAuthProvider>
  );
}
