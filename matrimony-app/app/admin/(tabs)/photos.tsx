import { Redirect } from 'expo-router';

export default function AdminPhotosRedirect() {
  return <Redirect href="/admin/(tabs)/users?view=photos" />;
}
