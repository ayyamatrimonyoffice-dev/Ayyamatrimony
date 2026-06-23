import { Redirect } from 'expo-router';

export default function AdminApprovalsRedirect() {
  return <Redirect href="/admin/(tabs)/users" />;
}
