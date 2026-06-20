import { useCallback, useEffect, useState } from 'react';
import {
  PublishedMember,
  readPublishedMembers,
} from '@/constants/memberDirectory';

export function useMemberDirectory() {
  const [published, setPublished] = useState<PublishedMember[]>([]);
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(async () => {
    const entries = await readPublishedMembers();
    setPublished(entries);
    setIsReady(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { published, isReady, refresh };
}
