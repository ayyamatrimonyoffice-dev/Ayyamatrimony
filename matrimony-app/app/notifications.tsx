import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { useLanguage } from '@/context/LanguageContext';
import { images } from '@/constants/images';
import { borderRadius, colors, fonts, spacing, typography } from '@/constants/theme';

type NotificationTab = 'all' | 'interactions' | 'urgent';

type NotificationKind = 'interest' | 'view' | 'grouped_view';

type NotificationItem = {
  id: string;
  kind: NotificationKind;
  section: 'today' | 'yesterday';
  name?: string;
  image?: string;
  groupedImages?: string[];
  otherCount?: number;
  hours: number;
  memberId?: string;
  urgent?: boolean;
};

function NotificationBody({ item }: { item: NotificationItem }) {
  const { translate, translateFormat } = useLanguage();

  if (item.kind === 'grouped_view' && item.name && item.otherCount != null) {
    return (
      <Text style={styles.bodyText}>
        <Text style={styles.nameBold}>{item.name}</Text>
        {` ${translateFormat('andOthersViewed', { count: item.otherCount })}`}
      </Text>
    );
  }

  const name = item.name ?? '';
  const suffix =
    item.kind === 'interest'
      ? translate('sentYouInterestSuffix')
      : translate('viewedYourProfileSuffix');

  return (
    <Text style={styles.bodyText}>
      <Text style={styles.nameBold}>{name}</Text>
      {` ${suffix}`}
    </Text>
  );
}

function NotificationRow({ item }: { item: NotificationItem }) {
  const { translate, translateFormat } = useLanguage();
  const router = useRouter();

  const actionLabel =
    item.kind === 'interest'
      ? translate('viewInterest')
      : item.kind === 'grouped_view'
        ? translate('seeWhoViewed')
        : translate('viewProfile');

  const handleAction = () => {
    if (item.memberId) {
      router.push(`/member/${item.memberId}`);
      return;
    }
    router.push('/(tabs)/matches');
  };

  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <View style={styles.avatarColumn}>
          {item.kind === 'grouped_view' && item.groupedImages?.length ? (
            <View style={styles.groupedAvatars}>
              {item.groupedImages.slice(0, 2).map((uri, index) => (
                <Image
                  key={`${item.id}-${index}`}
                  source={{ uri }}
                  style={[styles.groupedAvatar, index === 1 && styles.groupedAvatarOverlap]}
                />
              ))}
            </View>
          ) : item.image ? (
            <Image source={{ uri: item.image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialIcons name="person" size={22} color={colors.onSurfaceVariant} />
            </View>
          )}
        </View>

        <View style={styles.contentColumn}>
          <NotificationBody item={item} />
          <Pressable style={styles.actionButton} onPress={handleAction}>
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </Pressable>
        </View>

        <View style={styles.metaColumn}>
          <Text style={styles.timeText}>
            {translateFormat('hoursShort', { hours: item.hours })}
          </Text>
          <Pressable hitSlop={8} style={styles.menuButton}>
            <MaterialIcons name="more-horiz" size={20} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const { translate } = useLanguage();
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');

  const allNotifications: NotificationItem[] = useMemo(() => {
    const [first, second, third] = images.matches;

    return [
      {
        id: 'n1',
        kind: 'interest',
        section: 'today',
        name: 'S Shrinivas',
        image: first?.image,
        hours: 9,
        memberId: first?.id,
        urgent: true,
      },
      {
        id: 'n2',
        kind: 'view',
        section: 'today',
        name: 'Thangaraj G',
        hours: 15,
        memberId: second?.id,
      },
      {
        id: 'n3',
        kind: 'grouped_view',
        section: 'yesterday',
        name: 'Srinivasan',
        groupedImages: [second?.image, third?.image].filter(Boolean) as string[],
        otherCount: 29,
        hours: 24,
      },
      {
        id: 'n4',
        kind: 'view',
        section: 'yesterday',
        name: third?.name ?? 'Vignesh Mani',
        image: third?.image,
        hours: 28,
        memberId: third?.id,
      },
    ];
  }, []);

  const visibleNotifications = useMemo(() => {
    if (activeTab === 'urgent') {
      return allNotifications.filter((item) => item.urgent || item.kind === 'interest');
    }
    if (activeTab === 'interactions') {
      return allNotifications.filter((item) => item.kind !== 'view' || item.section === 'today');
    }
    return allNotifications;
  }, [activeTab, allNotifications]);

  const sections: { key: 'today' | 'yesterday'; label: string }[] = [
    { key: 'today', label: translate('today') },
    { key: 'yesterday', label: translate('yesterday') },
  ];

  const tabs: { key: NotificationTab; label: string }[] = [
    { key: 'all', label: translate('allTab') },
    { key: 'interactions', label: translate('interactions') },
    { key: 'urgent', label: translate('urgent') },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader title={translate('notifications')} showBack showTamil={false} />

      <View style={styles.tabsSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)}>
                {isActive ? (
                  <LinearGradient
                    colors={[colorsLocal.chipGradientStart, colorsLocal.chipGradientEnd]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.tabPillActive}
                  >
                    <Text style={styles.tabPillTextActive}>{tab.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.tabPill}>
                    <Text style={styles.tabPillText}>{tab.label}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section) => {
          const sectionItems = visibleNotifications.filter((item) => item.section === section.key);
          if (sectionItems.length === 0) {
            return null;
          }

          return (
            <View key={section.key} style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>{section.label}</Text>
              {sectionItems.map((item, index) => (
                <View key={item.id}>
                  <NotificationRow item={item} />
                  {index < sectionItems.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const colorsLocal = {
  chipGradientStart: '#00897B',
  chipGradientEnd: '#26A69A',
  chipBorder: '#D9D9D9',
  ctaOrange: '#F57C00',
  listBackground: '#F0F4F8',
  tabsBackground: '#FFF8F6',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colorsLocal.listBackground,
  },
  tabsSection: {
    backgroundColor: colorsLocal.tabsBackground,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colorsLocal.chipBorder,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.containerMargin,
  },
  tabPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colorsLocal.chipBorder,
    backgroundColor: colors.surfaceContainerLowest,
  },
  tabPillActive: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
  },
  tabPillText: {
    ...typography.labelLg,
    color: colors.onSurface,
    fontSize: 13,
  },
  tabPillTextActive: {
    ...typography.labelLg,
    color: '#fff',
    fontSize: 13,
    fontFamily: fonts.interSemi,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  sectionBlock: {
    backgroundColor: colors.surfaceContainerLowest,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    fontFamily: fonts.interSemi,
  },
  row: {
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.md,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  avatarColumn: {
    paddingTop: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerHigh,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupedAvatars: {
    width: 56,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
    backgroundColor: colors.surfaceContainerHigh,
  },
  groupedAvatarOverlap: {
    marginLeft: -14,
  },
  contentColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  bodyText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    lineHeight: 22,
  },
  nameBold: {
    fontFamily: fonts.interSemi,
    color: colors.onSurface,
  },
  actionButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colorsLocal.ctaOrange,
    backgroundColor: colors.surfaceContainerLowest,
  },
  actionButtonText: {
    ...typography.labelLg,
    color: colorsLocal.ctaOrange,
    fontSize: 13,
  },
  metaColumn: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    minWidth: 44,
  },
  timeText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
  menuButton: {
    padding: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colorsLocal.chipBorder,
    marginLeft: spacing.containerMargin + 48 + spacing.sm,
  },
});
