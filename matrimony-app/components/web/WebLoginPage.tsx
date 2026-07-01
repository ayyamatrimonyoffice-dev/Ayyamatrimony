import { type ReactNode } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LanguageLogoToggle } from '@/components/LanguageLogoToggle';
import { useWebLayout } from '@/hooks/useWebLayout';
import { images } from '@/constants/images';
import { colors, fonts } from '@/constants/theme';

type WebLoginPageProps = {
  form: ReactNode;
};

export function WebLoginPage({ form }: WebLoginPageProps) {
  const { loginMaxWidth, isDesktop } = useWebLayout();
  const { width } = useWindowDimensions();
  const stackLayout = !isDesktop || width < 900;

  return (
    <View style={styles.page}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.shell, stackLayout && styles.shellStacked, { maxWidth: loginMaxWidth }]}>
          <View style={styles.heroPanel}>
            <LinearGradient
              colors={['#8B2E2E', '#570000', '#3D1414']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.heroContent}>
              <View style={styles.heroTopRow}>
                <View style={styles.logoRing}>
                  <Image source={images.logo} style={styles.logo} resizeMode="contain" />
                </View>
                <LanguageLogoToggle variant="default" dense />
              </View>

              <Text style={styles.heroTitle}>Ayya Matrimony</Text>
              <Text style={styles.heroSubtitle}>
                Trusted Nadar community matrimony — find your life partner with verified profiles.
              </Text>

              <View style={styles.heroImageWrap}>
                <Image
                  source={images.bgIllustration}
                  style={styles.heroImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.badgeRow}>
                <View style={[styles.badge, styles.badgeHindu]}>
                  <Image source={images.logo} style={styles.badgeIcon} resizeMode="contain" />
                  <Text style={[styles.badgeText, { color: '#D4AF37' }]}>HINDU NADAR</Text>
                </View>
                <View style={[styles.badge, styles.badgeRc]}>
                  <MaterialCommunityIcons name="cross" size={14} color="#5BC2A8" />
                  <Text style={[styles.badgeText, { color: '#5BC2A8' }]}>RC NADAR</Text>
                </View>
                <View style={[styles.badge, styles.badgeCsi]}>
                  <MaterialCommunityIcons name="cross" size={14} color="#B971B9" />
                  <Text style={[styles.badgeText, { color: '#B971B9' }]}>CSI NADAR</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.formPanel}>
            <Text style={styles.formEyebrow}>Welcome</Text>
            <Text style={styles.formTitle}>Sign in or register</Text>
            <Text style={styles.formSubtitle}>
              Enter your mobile number to continue. Registration is free.
            </Text>
            {form}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F3EEE8',
    minHeight: '100vh' as unknown as number,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  shell: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: 28,
    overflow: 'hidden',
    minHeight: 620,
    backgroundColor: colors.surface,
    ...Platform.select({
      web: { boxShadow: '0 24px 80px rgba(87, 0, 0, 0.14)' },
      default: {},
    }),
  },
  shellStacked: {
    flexDirection: 'column',
    minHeight: 0,
  },
  heroPanel: {
    flex: 1.05,
    minWidth: 320,
    position: 'relative',
  },
  heroContent: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  heroTitle: {
    fontFamily: fonts.playfairSemi,
    fontSize: 40,
    lineHeight: 46,
    color: '#FFF8F0',
    marginTop: 28,
  },
  heroSubtitle: {
    fontFamily: fonts.inter,
    fontSize: 16,
    lineHeight: 26,
    color: 'rgba(255,248,240,0.86)',
    marginTop: 12,
    maxWidth: 420,
  },
  heroImageWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 180,
    marginVertical: 16,
  },
  heroImage: {
    width: '100%',
    maxWidth: 360,
    height: 220,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  badgeHindu: { borderColor: 'rgba(212,175,55,0.55)' },
  badgeRc: { borderColor: 'rgba(91,194,168,0.55)' },
  badgeCsi: { borderColor: 'rgba(185,113,185,0.55)' },
  badgeIcon: { width: 14, height: 14 },
  badgeText: {
    fontFamily: fonts.interSemi,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  formPanel: {
    flex: 0.95,
    minWidth: 320,
    paddingHorizontal: 36,
    paddingVertical: 40,
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  formEyebrow: {
    fontFamily: fonts.interSemi,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.secondary,
    marginBottom: 8,
  },
  formTitle: {
    fontFamily: fonts.playfairSemi,
    fontSize: 32,
    lineHeight: 38,
    color: colors.primary,
    marginBottom: 8,
  },
  formSubtitle: {
    fontFamily: fonts.inter,
    fontSize: 15,
    lineHeight: 24,
    color: colors.onSurfaceVariant,
    marginBottom: 24,
  },
});
