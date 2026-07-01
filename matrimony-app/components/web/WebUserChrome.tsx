import { type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { usePathname } from 'expo-router';
import { WebUserTopNav } from '@/components/web/WebUserTopNav';
import { useSubscription } from '@/context/SubscriptionContext';
import { useWebLayout } from '@/hooks/useWebLayout';
import { colors } from '@/constants/theme';

function isAdminRoute(pathname: string) {
  return pathname.startsWith('/admin');
}

function isPreTabUserRoute(pathname: string, isLoggedIn: boolean) {
  if (!isLoggedIn) {
    return true;
  }
  const path = pathname.replace(/\/+$/, '') || '/';
  return (
    path === '/' ||
    path === '/login' ||
    path.startsWith('/create-profile') ||
    path.startsWith('/payment-access') ||
    path.startsWith('/profile-setup')
  );
}

export function WebUserChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isLoggedIn } = useSubscription();
  const { isWeb, contentMaxWidth } = useWebLayout();

  if (!isWeb || isAdminRoute(pathname)) {
    return <>{children}</>;
  }

  const showTopNav = isLoggedIn && !isPreTabUserRoute(pathname, isLoggedIn);

  return (
    <View style={styles.root}>
      {showTopNav ? <WebUserTopNav /> : null}
      <View style={styles.main}>
        <View style={[styles.content, { maxWidth: contentMaxWidth }]}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
    ...Platform.select({
      web: { minHeight: '100vh' as unknown as number },
      default: {},
    }),
  },
  main: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
  },
});
