import { useEffect } from 'react';
import { Platform } from 'react-native';
import { getProfileShareUrl, getPublicOgImageUrl, PROFILE_SHARE_BASE_URL } from '@/lib/profileShare';

function upsertMeta(attribute: 'property' | 'name', key: string, content: string) {
  if (typeof document === 'undefined') {
    return;
  }

  const selector = `meta[${attribute}="${key}"]`;
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function useProfileShareMeta(options: {
  phone: string;
  name: string;
  photoUrl?: string;
  enabled?: boolean;
}) {
  const { phone, name, photoUrl, enabled = true } = options;

  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled || typeof document === 'undefined') {
      return;
    }

    const shareUrl = getProfileShareUrl(phone);
    const imageUrl = getPublicOgImageUrl(
      photoUrl,
      `${PROFILE_SHARE_BASE_URL}/assets/lotus-logo.png`,
    );
    const title = `${name.trim() || 'Profile'} - Ayya Matrimony`;

    document.title = title;
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', 'View matrimony profile on Ayya Matrimony');
    upsertMeta('property', 'og:url', shareUrl);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:image', imageUrl);
  }, [enabled, name, phone, photoUrl]);
}
