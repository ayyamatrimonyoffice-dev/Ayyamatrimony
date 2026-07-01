import { Alert, Linking, Platform } from 'react-native';

export const PROFILE_SHARE_BASE_URL = (
  process.env.EXPO_PUBLIC_PROFILE_SHARE_BASE_URL ?? 'https://matrimony-mobile-app-8541d.web.app'
).replace(/\/$/, '');

export function getProfileShareUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `${PROFILE_SHARE_BASE_URL}/share/profile/${digits}`;
}

export function getPublicOgImageUrl(photoUrl: string | undefined, fallbackUrl: string): string {
  const trimmed = photoUrl?.trim() ?? '';
  if (trimmed.startsWith('https://')) {
    return trimmed;
  }
  return fallbackUrl;
}

export async function shareProfileToWhatsApp(options: {
  phone: string;
  name: string;
  translate: (key: string) => string;
}): Promise<void> {
  const shareUrl = getProfileShareUrl(options.phone);
  const message = `${options.name.trim() || options.translate('adminMember')} - Ayya Matrimony\n${shareUrl}`;
  const encoded = encodeURIComponent(message);
  const nativeUrl = `whatsapp://send?text=${encoded}`;
  const webUrl = `https://wa.me/?text=${encoded}`;

  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.open(webUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    const canOpenNative = await Linking.canOpenURL(nativeUrl);
    if (canOpenNative) {
      await Linking.openURL(nativeUrl);
      return;
    }

    await Linking.openURL(webUrl);
  } catch {
    Alert.alert(options.translate('share'), options.translate('shareWhatsappUnavailable'));
  }
}
