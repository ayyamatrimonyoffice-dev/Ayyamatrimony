import type { RefObject } from 'react';
import type { View } from 'react-native';

/** Web/fallback stub — Metro resolves `biodataShare.native.ts` on Android/iOS. */
export async function shareBiodataSheetAsImage(
  _printRootRef: RefObject<View>,
  _options?: { fileName?: string; dialogTitle?: string },
): Promise<void> {
  throw new Error('share-image-unavailable');
}
