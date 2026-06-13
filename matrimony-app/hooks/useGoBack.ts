import { useRouter, type Href } from 'expo-router';

export function useGoBack(fallbackRoute: Href) {
  const router = useRouter();

  return () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(fallbackRoute);
  };
}
