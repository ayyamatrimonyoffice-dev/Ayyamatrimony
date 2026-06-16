import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminColors } from '@/constants/admin';

type AdminScreenShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerRight?: ReactNode;
};

export function AdminScreenShell({
  title,
  subtitle,
  children,
  headerRight,
}: AdminScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {headerRight}
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: adminColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: adminColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: adminColors.border,
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: adminColors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: adminColors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
});
