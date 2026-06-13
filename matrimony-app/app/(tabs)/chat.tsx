import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { useLanguage } from '@/context/LanguageContext';
import { colors, spacing, typography } from '@/constants/theme';
import { images } from '@/constants/images';

export default function ChatScreen() {
  const { translate } = useLanguage();
  const chats = images.matches.map((match, index) => ({
    ...match,
    message: index === 0 ? translate('chatMessage1') : translate('chatMessage2'),
    time: index === 0 ? translate('timeAgo2m') : translate('timeAgo1h'),
    unread: index === 0,
  }));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader title={translate('chat')} showBack={false} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {chats.map((chat) => (
          <Pressable key={chat.name} style={styles.row}>
            <Image source={{ uri: chat.image }} style={styles.avatar} />
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.name}>{chat.name}</Text>
                <Text style={styles.time}>{chat.time}</Text>
              </View>
              <Text style={[styles.message, chat.unread && styles.messageUnread]} numberOfLines={1}>
                {chat.message}
              </Text>
            </View>
            {chat.unread ? <View style={styles.dot} /> : null}
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingTop: 72,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 191, 185, 0.15)',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    ...typography.titleLg,
    fontSize: 16,
    color: colors.primary,
  },
  time: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  message: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  messageUnread: {
    color: colors.onSurface,
    fontFamily: typography.labelLg.fontFamily,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceTint,
  },
});
