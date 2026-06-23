import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminColors } from '@/constants/admin';
import { adminStatusLabelKey } from '@/constants/adminLabels';
import { getOptionLabel } from '@/constants/formOptions';
import type { TranslationKey } from '@/constants/i18n';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  blockProfileByPhone,
  deleteProfileByPhone,
  fetchProfileByPhone,
  unblockProfileByPhone,
} from '@/lib/firestore/profileService';
import { updateApprovalStatus } from '@/lib/firestore/approvalService';
import { adminGrantPayment } from '@/lib/firestore/paymentService';
import { approvalDocIdFromPhone, type FirestoreProfileDoc } from '@/lib/firestore/collections';

function labelCommunity(value: string | undefined, translate: (key: TranslationKey) => string) {
  if (value === 'hindu') return translate('hindu');
  if (value === 'christian') return translate('christian');
  return value || '—';
}

export default function AdminUserDetailScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { isReady, isAuthenticated } = useAdminAuth();
  const { language, translate, translateFormat } = useLanguage();
  const [profile, setProfile] = useState<FirestoreProfileDoc | null>(null);

  const refresh = useCallback(async () => {
    if (!phone) return;
    const entry = await fetchProfileByPhone(phone);
    setProfile(entry);
  }, [phone]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  if (!isReady) return null;
  if (!isAuthenticated) return <Redirect href="/" />;
  if (!phone) return <Redirect href="/admin/(tabs)/users" />;

  const biodata = profile?.biodata ?? {};
  const community = profile?.registrationCommunity || biodata.registrationCommunity;
  const gender = profile?.gender || biodata.gender;
  const approvalStatus = profile?.approvalStatus;
  const accountStatus = profile?.accountStatus || 'active';
  const source = profile?.registrationSource === 'admin' ? translate('adminSourceAdmin') : translate('adminSourceSelf');
  const genderLabel = gender
    ? getOptionLabel('gender', gender, language, gender)
    : '—';
  const statusLabel = [
    approvalStatus ? translate(adminStatusLabelKey(approvalStatus)) : '—',
    translate(adminStatusLabelKey(accountStatus)),
  ].join(' · ');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={22} color={adminColors.text} />
        </Pressable>
        <Text style={styles.title}>{profile?.fullName || phone}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.meta}>{translateFormat('adminMetaPhone', { value: phone })}</Text>
        <Text style={styles.meta}>
          {translateFormat('adminMetaCommunity', { value: labelCommunity(community, translate) })}
        </Text>
        <Text style={styles.meta}>{translateFormat('adminMetaGender', { value: genderLabel })}</Text>
        <Text style={styles.meta}>{translateFormat('adminMetaStatus', { value: statusLabel })}</Text>
        <Text style={styles.meta}>
          {translateFormat('adminMetaPaidBatches', { count: profile?.paidBatches ?? 0 })}
        </Text>
        <Text style={styles.meta}>{translateFormat('adminMetaSource', { value: source })}</Text>

        <View style={styles.actions}>
          <Pressable
            style={[styles.btn, styles.primaryBtn]}
            onPress={() => router.push(`/admin/view-profile/${phone}` as never)}
          >
            <Text style={styles.primaryText}>{translate('viewBiodataSummary')}</Text>
          </Pressable>

          <Pressable
            style={[styles.btn, styles.outlineBtn]}
            onPress={() => router.push('/admin/add-member')}
          >
            <Text style={styles.outlineText}>{translate('adminEditViaForm')}</Text>
          </Pressable>

          <Pressable
            style={[styles.btn, styles.successBtn]}
            onPress={() => {
              void updateApprovalStatus(approvalDocIdFromPhone(phone), 'approved').then(refresh);
            }}
          >
            <Text style={styles.successText}>{translate('adminApproveProfile')}</Text>
          </Pressable>

          <Pressable
            style={[styles.btn, styles.successBtn]}
            onPress={() => {
              void adminGrantPayment(phone, profile?.fullName).then(() => {
                Alert.alert(translate('adminPaymentGranted'), translate('adminPaymentGrantedBody'));
                void refresh();
              });
            }}
          >
            <Text style={styles.successText}>{translate('adminGrantAccess')}</Text>
          </Pressable>

          <Pressable
            style={[styles.btn, styles.warnBtn]}
            onPress={() => {
              const blocked = profile?.accountStatus === 'blocked';
              void (blocked ? unblockProfileByPhone(phone) : blockProfileByPhone(phone)).then(refresh);
            }}
          >
            <Text style={styles.warnText}>
              {profile?.accountStatus === 'blocked'
                ? translate('adminUnblockUser')
                : translate('adminBlockUser')}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.btn, styles.dangerBtn]}
            onPress={() => {
              Alert.alert(translate('adminDeleteProfileTitle'), translate('adminDeleteProfileBody'), [
                { text: translate('cancel'), style: 'cancel' },
                {
                  text: translate('adminDelete'),
                  style: 'destructive',
                  onPress: () => {
                    void deleteProfileByPhone(phone).then(() => router.back());
                  },
                },
              ]);
            }}
          >
            <Text style={styles.dangerText}>{translate('adminDeleteProfile')}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: adminColors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: adminColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: adminColors.border,
  },
  title: { flex: 1, fontSize: 18, fontWeight: '700', color: adminColors.text },
  content: { padding: 16, gap: 8 },
  meta: { color: adminColors.text, fontSize: 14, lineHeight: 20 },
  actions: { gap: 10, marginTop: 16 },
  btn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1 },
  primaryBtn: { backgroundColor: adminColors.primary, borderColor: adminColors.primary },
  primaryText: { color: '#fff', fontWeight: '700' },
  outlineBtn: { backgroundColor: adminColors.surface, borderColor: adminColors.border },
  outlineText: { color: adminColors.text, fontWeight: '700' },
  successBtn: { backgroundColor: `${adminColors.success}14`, borderColor: `${adminColors.success}55` },
  successText: { color: adminColors.success, fontWeight: '700' },
  warnBtn: { backgroundColor: `${adminColors.warning}14`, borderColor: `${adminColors.warning}55` },
  warnText: { color: adminColors.warning, fontWeight: '700' },
  dangerBtn: { backgroundColor: `${adminColors.danger}10`, borderColor: `${adminColors.danger}44` },
  dangerText: { color: adminColors.danger, fontWeight: '700' },
});
