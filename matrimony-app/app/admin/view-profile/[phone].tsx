import { useCallback, useEffect, useState } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminMatrimonyProfileLoader, AdminMatrimonyProfileView } from '@/components/admin/AdminMatrimonyProfileView';
import { adminColors } from '@/constants/admin';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  fetchProfileByPhone,
  hydrateLocalProfileFromFirestore,
  setProfileBrowseHidden,
} from '@/lib/firestore/profileService';
import { StyleSheet, Text, View } from 'react-native';

export default function AdminViewProfileScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { isReady, isAuthenticated } = useAdminAuth();
  const { translate } = useLanguage();
  const [profileValues, setProfileValues] = useState<Record<string, string> | null>(null);
  const [browseHidden, setBrowseHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!phone) {
      setProfileValues(null);
      setBrowseHidden(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [biodata, profileDoc] = await Promise.all([
        hydrateLocalProfileFromFirestore(phone),
        fetchProfileByPhone(phone),
      ]);
      setProfileValues(biodata);
      setBrowseHidden(profileDoc?.browseHidden === true);
    } finally {
      setIsLoading(false);
    }
  }, [phone]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleBrowseHiddenChange = useCallback(
    (hidden: boolean) => {
      if (!phone) return;
      setBrowseHidden(hidden);
      void setProfileBrowseHidden(phone, hidden);
    },
    [phone],
  );

  if (!isReady) {
    return <AdminMatrimonyProfileLoader />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  if (!phone) {
    return <Redirect href="/admin/(tabs)/matches" />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {isLoading ? (
        <AdminMatrimonyProfileLoader />
      ) : !profileValues ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{translate('adminNoBiodata')}</Text>
        </View>
      ) : (
        <AdminMatrimonyProfileView
          profileValues={profileValues}
          phone={phone}
          browseHidden={browseHidden}
          onBrowseHiddenChange={handleBrowseHiddenChange}
          onBack={() => router.back()}
          onEdit={() => router.push(`/admin/add-member?phone=${phone}` as never)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: adminColors.background,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    color: adminColors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});
