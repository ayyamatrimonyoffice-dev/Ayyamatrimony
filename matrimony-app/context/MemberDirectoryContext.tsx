import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PublishedMember, readPublishedMembers } from '@/constants/memberDirectory';

type MemberDirectoryContextValue = {
  published: PublishedMember[];
  isReady: boolean;
  refresh: () => Promise<void>;
};

const MemberDirectoryContext = createContext<MemberDirectoryContextValue | null>(null);

export function MemberDirectoryProvider({ children }: { children: ReactNode }) {
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

  const value = useMemo(
    () => ({ published, isReady, refresh }),
    [isReady, published, refresh],
  );

  return <MemberDirectoryContext.Provider value={value}>{children}</MemberDirectoryContext.Provider>;
}

export function useMemberDirectory() {
  const context = useContext(MemberDirectoryContext);
  if (!context) {
    throw new Error('useMemberDirectory must be used within MemberDirectoryProvider');
  }
  return context;
}
