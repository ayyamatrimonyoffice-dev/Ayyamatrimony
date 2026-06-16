import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/context/LanguageContext';
import { useProfileForm } from '@/context/ProfileFormContext';
import { borderRadius, colors, fonts, spacing, typography } from '@/constants/theme';
import { images } from '@/constants/images';
import { filterByRecommendedGender } from '@/constants/matchFilters';

type MessageTab = 'received' | 'awaiting' | 'calls';

type MessageItem = {
  id: string;
  name: string;
  image: string;
  verified?: boolean;
  message: string;
  time: string;
  unreadCount: number;
  waitingForResponse: boolean;
  isPaidMember: boolean;
};

function MessageRow({ item }: { item: MessageItem }) {
  const { translate } = useLanguage();

  return (
    <Pressable style={styles.messageRow}>
      <View style={styles.avatarWrap}>
        <Image source={{ uri: item.image }} style={styles.avatar} />
        {item.isPaidMember ? (
          <View style={styles.crownBadge}>
            <MaterialIcons name="workspace-premium" size={11} color="#fff" />
          </View>
        ) : null}
      </View>

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <View style={styles.previewRow}>
          <Text
            style={[styles.messagePreview, item.unreadCount > 0 && styles.messagePreviewUnread]}
            numberOfLines={1}
          >
            {item.message}
          </Text>
          {item.unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>

        {item.waitingForResponse ? (
          <View style={styles.waitingRow}>
            <MaterialIcons name="reply" size={14} color={colorsLocal.waitingText} />
            <Text style={styles.waitingText}>{translate('waitingForYourResponse')}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function ChatScreen() {
  const { translate, translateFormat } = useLanguage();
  const { getValue } = useProfileForm();
  const [activeTab, setActiveTab] = useState<MessageTab>('received');
  const userGender = getValue('gender');

  const recommendedMatches = useMemo(
    () => filterByRecommendedGender(images.matches, userGender),
    [userGender],
  );

  const allMessages: MessageItem[] = useMemo(
    () =>
      recommendedMatches.map((match, index) => ({
        id: match.id,
        name: match.name,
        image: match.image,
        verified: match.verified,
        message:
          index === 0 ? translate('chatMessagePreview1') : translate('chatMessagePreview2'),
        time: index === 0 ? translate('yesterday') : '12 Jun 2026',
        unreadCount: index === 0 ? 1 : index === 1 ? 2 : 0,
        waitingForResponse: index < 2,
        isPaidMember: Boolean(match.verified) || index < 2,
      })),
    [recommendedMatches, translate],
  );

  const visibleMessages = useMemo(() => {
    if (activeTab === 'awaiting') {
      return allMessages.filter((item) => item.waitingForResponse);
    }
    if (activeTab === 'calls') {
      return [];
    }
    return allMessages;
  }, [activeTab, allMessages]);

  const paidMemberCount = allMessages.filter((item) => item.isPaidMember).length;

  const tabs: { key: MessageTab; label: string; dot?: boolean }[] = [
    { key: 'received', label: translate('received') },
    { key: 'awaiting', label: translate('awaitingResponse') },
    { key: 'calls', label: translate('calls'), dot: true },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>{translate('messagesTitle')}</Text>

        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.key)}
              >
                <View style={styles.tabLabelRow}>
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
                  {tab.dot ? <View style={styles.tabDot} /> : null}
                </View>
                {isActive ? <View style={styles.tabIndicator} /> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.sectionToolsRow}>
          <Text style={styles.sectionSubtitle}>
            {translateFormat('incomingPaidMessages', { count: paidMemberCount })}
          </Text>
          <View style={styles.sectionActions}>
            <Pressable style={styles.filterActionBtn}>
              <MaterialIcons name="tune" size={16} color={colors.onSurface} />
              <Text style={styles.filterActionText}>{translate('filter')}</Text>
            </Pressable>
            <Pressable style={styles.searchBtn} hitSlop={8}>
              <MaterialIcons name="search" size={22} color={colors.onSurface} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {activeTab === 'calls' ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="call" size={40} color={colors.onSurfaceVariant} />
            <Text style={styles.emptyText}>{translate('noCallsYet')}</Text>
          </View>
        ) : (
          visibleMessages.map((item) => <MessageRow key={item.id} item={item} />)
        )}

        {activeTab !== 'calls' ? (
          <Pressable style={styles.serviceRow}>
            <View style={styles.serviceIconWrap}>
              <View style={styles.serviceIconInner}>
                <MaterialIcons name="support-agent" size={24} color={colorsLocal.serviceGreen} />
              </View>
              <View style={styles.serviceOnlineDot} />
            </View>
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitle}>{translate('assistedService')}</Text>
              <Text style={styles.serviceDesc}>{translate('assistedServiceDesc')}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const colorsLocal = {
  tabActive: '#00897B',
  chipBorder: '#D9D9D9',
  rowTint: '#EEF2FA',
  waitingText: '#E65100',
  unreadOrange: '#FF9800',
  tabDot: '#FF9800',
  serviceGreen: '#43A047',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  header: {
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
  },
  screenTitle: {
    ...typography.headlineMd,
    fontSize: 22,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 8,
    position: 'relative',
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  tabText: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    fontSize: 13,
    textAlign: 'center',
  },
  tabTextActive: {
    color: colorsLocal.tabActive,
    fontFamily: fonts.interSemi,
  },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colorsLocal.tabDot,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.xs,
    right: spacing.xs,
    height: 3,
    borderRadius: 2,
    backgroundColor: colorsLocal.tabActive,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colorsLocal.chipBorder,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionToolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colorsLocal.chipBorder,
    backgroundColor: colors.surfaceContainerLowest,
  },
  filterActionText: {
    ...typography.labelLg,
    color: colors.onSurface,
    fontSize: 13,
  },
  searchBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.md,
    backgroundColor: colorsLocal.rowTint,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colorsLocal.chipBorder,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceContainerHigh,
  },
  crownBadge: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7B1FA2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.surfaceContainerLowest,
  },
  messageContent: {
    flex: 1,
    gap: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    ...typography.titleLg,
    fontSize: 16,
    color: colors.onSurface,
    fontFamily: fonts.interSemi,
    flex: 1,
  },
  time: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  messagePreview: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  messagePreviewUnread: {
    color: colors.onSurface,
    fontFamily: typography.labelLg.fontFamily,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colorsLocal.unreadOrange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    ...typography.labelSm,
    color: '#fff',
    fontSize: 11,
    fontFamily: fonts.interSemi,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  waitingText: {
    ...typography.labelSm,
    color: colorsLocal.waitingText,
    fontFamily: typography.labelLg.fontFamily,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colorsLocal.chipBorder,
    marginTop: spacing.sm,
  },
  serviceIconWrap: {
    position: 'relative',
  },
  serviceIconInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceOnlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colorsLocal.serviceGreen,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
  },
  serviceContent: {
    flex: 1,
    gap: 2,
  },
  serviceTitle: {
    ...typography.titleLg,
    fontSize: 16,
    color: colors.onSurface,
    fontFamily: fonts.interSemi,
  },
  serviceDesc: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
});
