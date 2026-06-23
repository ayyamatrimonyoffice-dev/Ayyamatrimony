import { MaterialIcons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { images } from '@/constants/images';
import { colors, fonts, spacing, typography } from '@/constants/theme';

type ProtectedProfileImageProps = {
  imageUri: string;
  locked: boolean;
  pendingModeration?: boolean;
  style?: object;
  imageStyle?: object;
};

export function ProtectedProfileImage({
  imageUri,
  locked,
  pendingModeration = false,
  style,
  imageStyle,
}: ProtectedProfileImageProps) {
  const { translate } = useLanguage();
  const hasImage = Boolean(imageUri?.trim());
  const isLocked = locked || pendingModeration;

  return (
    <View style={[styles.wrap, style]}>
      {hasImage ? (
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, imageStyle, isLocked && styles.imageLocked]}
          blurRadius={isLocked ? 18 : 0}
        />
      ) : (
        <Image source={images.logo} style={[styles.image, imageStyle]} resizeMode="cover" />
      )}
      {isLocked ? (
        <View style={styles.overlay}>
          <MaterialIcons name="lock" size={22} color="#fff" />
          <Text style={styles.overlayText}>
            {pendingModeration ? translate('photoPendingReview') : translate('photoLocked')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerHigh,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLocked: {
    opacity: 0.35,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 0, 0, 0.42)',
    gap: 4,
    paddingHorizontal: spacing.xs,
  },
  overlayText: {
    color: '#fff',
    fontSize: 10,
    lineHeight: 13,
    fontFamily: fonts.interSemi,
    textAlign: 'center',
  },
});
