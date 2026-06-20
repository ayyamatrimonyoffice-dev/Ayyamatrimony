import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { CreateProfileBiodataForm } from '@/components/CreateProfileBiodataForm';
import { colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';

export default function ViewProfileScreen() {
  const router = useRouter();
  const { translate } = useLanguage();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <AppHeader
        title={translate('viewProfile')}
        showBack
        showTamil={false}
        onBack={() => router.back()}
      />
      <View style={styles.formWrap}>
        <CreateProfileBiodataForm editable={false} viewOnly onSave={() => undefined} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F7FC',
  },
  formWrap: {
    flex: 1,
    paddingTop: 56,
  },
});
