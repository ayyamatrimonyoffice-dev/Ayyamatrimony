import type { RefObject } from 'react';
import type { View } from 'react-native';

export async function shareBiodataSheetAsImage(
  _printRootRef: RefObject<View>,
  _options?: { fileName?: string; dialogTitle?: string },
): Promise<void> {
  throw new Error('share-image-unavailable');
}
