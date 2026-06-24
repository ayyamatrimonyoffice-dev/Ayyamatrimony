import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { adminColors } from '@/constants/admin';
import { colors } from '@/constants/theme';

type BiodataExportPanelProps = {
  includePhoto: boolean;
  onIncludePhotoChange: (value: boolean) => void;
  onPickPhoto: () => void;
  hasExportPhoto: boolean;
  hasProfilePhoto: boolean;
  variant?: 'default' | 'admin';
};

export function BiodataExportPanel({
  includePhoto,
  onIncludePhotoChange,
  onPickPhoto,
  hasExportPhoto,
  hasProfilePhoto,
  variant = 'default',
}: BiodataExportPanelProps) {
  const { translate } = useLanguage();
  const palette =
    variant === 'admin'
      ? adminColors
      : {
          primary: colors.primary,
          text: colors.onSurface,
          textMuted: colors.onSurfaceVariant,
          border: colors.outlineVariant,
          surface: colors.surface,
        };

  return (
    <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <Text style={[styles.title, { color: palette.text }]}>{translate('exportBiodata')}</Text>

      <View style={styles.row}>
        <Text style={[styles.label, { color: palette.text }]}>{translate('includePhotoInExport')}</Text>
        <Switch
          value={includePhoto}
          onValueChange={onIncludePhotoChange}
          trackColor={{ true: palette.primary, false: palette.border }}
          thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
        />
      </View>

      {includePhoto ? (
        <View style={styles.photoActions}>
          <Pressable
            style={[styles.photoButton, { borderColor: palette.primary }]}
            onPress={onPickPhoto}
          >
            <MaterialIcons name="add-a-photo" size={16} color={palette.primary} />
            <Text style={[styles.photoButtonText, { color: palette.primary }]}>
              {hasExportPhoto || hasProfilePhoto
                ? translate('changeExportPhoto')
                : translate('addPhotoForExport')}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  photoActions: {
    gap: 6,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  photoButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
