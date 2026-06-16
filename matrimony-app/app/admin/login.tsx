import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Href, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminColors } from '@/constants/admin';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { signIn } = useAdminAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    const result = await signIn(phone, otp);
    setLoading(false);
    if (!result.ok) {
      setError(result.message ?? 'Login failed.');
      return;
    }
    router.replace('/admin/(tabs)/' as Href);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.brandBadge}>
            <MaterialIcons name="admin-panel-settings" size={32} color={adminColors.primary} />
          </View>
          <Text style={styles.title}>Ayya Admin</Text>
          <Text style={styles.subtitle}>Matrimony control panel</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Admin mobile number</Text>
            <View style={styles.phoneRow}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="9999999999"
                placeholderTextColor={adminColors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <Text style={styles.label}>OTP</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit OTP"
              placeholderTextColor={adminColors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={() => void handleSignIn()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign in to Admin</Text>
              )}
            </Pressable>
          </View>

          <Pressable style={styles.backLink} onPress={() => router.replace('/welcome')}>
            <MaterialIcons name="arrow-back" size={16} color={adminColors.textMuted} />
            <Text style={styles.backLinkText}>Back to user app</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: adminColors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  brandBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: adminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    color: adminColors.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: adminColors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  card: {
    backgroundColor: adminColors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: adminColors.border,
    gap: 8,
  },
  label: {
    color: adminColors.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryCode: {
    color: adminColors.text,
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: adminColors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: adminColors.border,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: adminColors.text,
    backgroundColor: '#fff',
  },
  error: {
    color: adminColors.danger,
    fontSize: 13,
    marginTop: 4,
  },
  button: {
    marginTop: 12,
    backgroundColor: adminColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  backLinkText: {
    color: adminColors.textMuted,
    fontSize: 13,
  },
});
