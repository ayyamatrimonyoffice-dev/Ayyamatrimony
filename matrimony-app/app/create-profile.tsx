import { useCallback, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreateProfileBiodataForm } from '@/components/CreateProfileBiodataForm';
import { LanguageLogoToggle } from '@/components/LanguageLogoToggle';
import { useLanguage } from '@/context/LanguageContext';

export default function CreateProfileScreen() {
  const router = useRouter();
  const { translate } = useLanguage();
  const [editable, setEditable] = useState(true);

  const handleDownloadPdf = useCallback(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
      return;
    }

    Alert.alert(
      translate('downloadPdfAlertTitle'),
      translate('downloadPdfAlertBody'),
    );
  }, [translate]);

  const handleEditProfile = useCallback(() => {
    setEditable((current) => !current);
  }, []);

  const handleSave = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderRow}>
          <View style={styles.pageHeaderText}>
            <Text style={styles.pageTitle} numberOfLines={2}>
              {translate('getStarted')}
            </Text>
          </View>
          <LanguageLogoToggle variant="maroon" compact />
        </View>
      </View>
      <CreateProfileBiodataForm
        editable={editable}
        onSave={handleSave}
        onDownloadPdf={handleDownloadPdf}
        onEditProfile={handleEditProfile}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  pageHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(176, 0, 0, 0.15)',
  },
  pageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pageHeaderText: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 2,
  },
  pageTitle: {
    color: '#8B0000',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
    includeFontPadding: true,
  },
});
