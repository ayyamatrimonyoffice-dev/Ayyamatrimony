import { ReactNode } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Constants from 'expo-constants';
import { useRouter, type Href } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/context/LanguageContext';
import { useProfileForm } from '@/context/ProfileFormContext';
import { useSubscription } from '@/context/SubscriptionContext';
import {
  getProfileAvatarSource,
  getProfileFirstName,
} from '@/constants/profileDisplay';
import { TranslationKey } from '@/constants/i18n';
import { borderRadius, colors, fonts, spacing, typography } from '@/constants/theme';
type SideMenuDrawerProps = {
  visible: boolean;
  onClose: () => void;
};

type MenuLink = {
  labelKey: TranslationKey;
  route?: Href;
};

const MAIN_LINKS: MenuLink[] = [
  { labelKey: 'editProfile', route: '/edit-profile' },
  { labelKey: 'editPreferences', route: '/partner-preferences' },
  { labelKey: 'verifyYourProfile', route: '/edit-profile' },
  { labelKey: 'consultAstrologer' },
  { labelKey: 'downloadMatrimonyBiodata' },
  { labelKey: 'freeAstrologyConsultation' },
];

const SUPPORT_LINKS: MenuLink[] = [
  { labelKey: 'settings', route: '/settings' },
  { labelKey: 'help', route: { pathname: '/info/[type]', params: { type: 'help' } } },
  { labelKey: 'rateUs' },
  { labelKey: 'successStories' },
  { labelKey: 'more' },
];

const SERVICE_LINKS: MenuLink[] = [
  { labelKey: 'serviceMatrimonyBiodata' },
  { labelKey: 'serviceMatchAstro' },
  { labelKey: 'serviceAstroFreeChat' },
  { labelKey: 'serviceWeddingBazaar' },
  { labelKey: 'serviceMandap' },
];

function MenuSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View style={styles.sectionBlock}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

function MenuRow({
  label,
  onPress,
  multiline,
}: {
  label: string;
  onPress: () => void;
  multiline?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
      onPress={onPress}
    >
      <Text style={[styles.menuRowText, multiline && styles.menuRowTextMultiline]}>{label}</Text>
    </Pressable>
  );
}

export function SideMenuDrawer({ visible, onClose }: SideMenuDrawerProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { translate, translateFormat } = useLanguage();
  const { values } = useProfileForm();
  const { isPaidMember, hasPaidProfileQuota } = useSubscription();

  const drawerWidth = Math.min(width * 0.88, 360);
  const profileName =
    values.fullName?.trim() || getProfileFirstName(values.fullName ?? '') || translate('profile');
  const avatarSource = getProfileAvatarSource(values);
  const memberId = values.memberId?.trim() || 'AM12544442';
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const navigate = (route?: Href) => {
    onClose();
    if (route) {
      router.push(route);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />

        <View
          style={[
            styles.drawer,
            {
              width: drawerWidth,
              paddingTop: insets.top,
              paddingBottom: Math.max(insets.bottom, spacing.md),
            },
          ]}
        >
          <View style={styles.drawerHeader}>
            <Pressable style={styles.backButton} onPress={onClose} hitSlop={8}>
              <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.drawerContent}
          >
            <View style={styles.profileHeader}>
              <Pressable onPress={() => navigate('/edit-profile')}>
                <View style={styles.avatarWrap}>
                  <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
                  <View style={styles.cameraBadge}>
                    <MaterialIcons name="photo-camera" size={12} color="#fff" />
                  </View>
                </View>
              </Pressable>

              <View style={styles.profileMeta}>
                <Text style={styles.profileName}>{profileName}</Text>
                <Text style={styles.memberId}>{memberId}</Text>
                <Text style={styles.memberType}>
                  {isPaidMember ? translate('membershipPaid') : translate('freeMember')}
                </Text>
              </View>
            </View>

            {!hasPaidProfileQuota ? (
            <View style={styles.upgradeBanner}>
              <Text style={styles.upgradeCopy}>{translate('upgradeMembershipBanner')}</Text>
              <Pressable
                style={styles.upgradeButton}
                onPress={() => navigate('/upgrade')}
              >
                <Text style={styles.upgradeButtonText}>{translate('upgradeNow')}</Text>
              </Pressable>
            </View>
            ) : null}

            <Pressable style={styles.switchAccountCard}>
              <Text style={styles.switchAccountText}>{translate('switchAccount')}</Text>
              <View style={styles.switchAccountIcon}>
                <MaterialIcons name="favorite" size={18} color="#fff" />
              </View>
            </Pressable>

            <MenuSection>
              {MAIN_LINKS.map((item, index) => (
                <View key={item.labelKey}>
                  <MenuRow
                    label={translate(item.labelKey)}
                    onPress={() => navigate(item.route)}
                    multiline={item.labelKey === 'freeAstrologyConsultation'}
                  />
                  {index < MAIN_LINKS.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </MenuSection>

            <MenuSection title={translate('supportAndFeedback')}>
              {SUPPORT_LINKS.map((item, index) => (
                <View key={item.labelKey}>
                  <MenuRow label={translate(item.labelKey)} onPress={() => navigate(item.route)} />
                  {index < SUPPORT_LINKS.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </MenuSection>

            <MenuSection title={translate('ayyaOtherServices')}>
              {SERVICE_LINKS.map((item, index) => (
                <View key={item.labelKey}>
                  <MenuRow label={translate(item.labelKey)} onPress={onClose} />
                  {index < SERVICE_LINKS.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </MenuSection>

            <Text style={styles.versionText}>
              {translateFormat('appVersionLabel', { version: appVersion })}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const colorsLocal = {
  upgradeBanner: '#FFF0E8',
  ctaOrange: '#F57C00',
  switchIcon: '#E53935',
  divider: '#E8E8E8',
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  drawer: {
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 4, height: 0 },
    elevation: 12,
  },
  drawerHeader: {
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: spacing.xs,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  drawerContent: {
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceContainerHigh,
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.onSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    ...typography.titleLg,
    fontSize: 18,
    color: colors.onSurface,
    fontFamily: fonts.interSemi,
  },
  memberId: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  memberType: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colorsLocal.upgradeBanner,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  upgradeCopy: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  upgradeButton: {
    backgroundColor: colorsLocal.ctaOrange,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  upgradeButtonText: {
    ...typography.labelLg,
    color: colors.onPrimary,
    fontSize: 12,
    fontFamily: fonts.interSemi,
  },
  switchAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colorsLocal.divider,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  switchAccountText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontSize: 15,
  },
  switchAccountIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colorsLocal.switchIcon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBlock: {
    gap: 0,
  },
  sectionTitle: {
    ...typography.titleLg,
    fontSize: 15,
    color: colors.onSurface,
    fontFamily: fonts.interSemi,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  menuRow: {
    paddingVertical: spacing.md,
    paddingRight: spacing.sm,
  },
  menuRowPressed: {
    opacity: 0.7,
  },
  menuRowText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontSize: 15,
  },
  menuRowTextMultiline: {
    lineHeight: 22,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colorsLocal.divider,
  },
  versionText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    textAlign: 'left',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
});
