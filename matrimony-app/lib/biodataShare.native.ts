import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import type { View } from 'react-native';

export async function shareBiodataSheetAsImage(
  printRootRef: RefObject<View>,
  options?: { fileName?: string; dialogTitle?: string },
): Promise<void> {
  if (!printRootRef.current) {
    throw new Error('share-capture-missing');
  }

  const sharingAvailable = await Sharing.isAvailableAsync();
  if (!sharingAvailable) {
    throw new Error('share-unavailable');
  }

  const capturedUri = await captureRef(printRootRef, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
  });

  const safeName = (options?.fileName ?? `biodata-${Date.now()}`)
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-');
  const destUri = `${FileSystem.cacheDirectory}${safeName}.png`;

  await FileSystem.copyAsync({ from: capturedUri, to: destUri });

  await Sharing.shareAsync(destUri, {
    mimeType: 'image/png',
    dialogTitle: options?.dialogTitle ?? 'Share biodata',
    UTI: 'public.png',
  });
}
