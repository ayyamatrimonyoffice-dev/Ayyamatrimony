import { createElement, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SelectField } from '@/components/FormControls';
import { BiodataPropertyField } from '@/components/BiodataPropertyField';
import { getPropertyDisplayValue } from '@/constants/biodataProperty';
import { FormOptionsKey, getFormOptions, getOptionLabel } from '@/constants/formOptions';
import { getLogoUri, images } from '@/constants/images';
import { Language } from '@/constants/i18n';
import { isChristianRegistration, type RegistrationCommunityId } from '@/constants/registrationCommunities';
import { useProfileForm } from '@/context/ProfileFormContext';
import { useLanguage } from '@/context/LanguageContext';
import { borderRadius, colors, fonts, spacing } from '@/constants/theme';

const SHEET_BORDER = colors.primary;
const HOROSCOPE_RED = colors.primary;

const FIELD_BG = colors.surfaceContainerLowest;
const FIELD_BORDER = 'rgba(87, 0, 0, 0.1)';
const SIDEBAR_CARD_BG = 'rgba(255, 255, 255, 0.88)';
const SIDEBAR_PANEL_BG = '#ffffff';
const PLACEHOLDER = 'rgba(90, 65, 61, 0.38)';

const fieldShadow = Platform.select({
  web: { boxShadow: '0 2px 10px rgba(87, 0, 0, 0.05)' },
  default: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
});

const HOROSCOPE_SIZE = 4;
const DETAIL_GRID_COUNT = 33;
const DETAIL_GRID_ROW_SIZES = [17, 16] as const;
const BIODATA_PRINT_STYLE_ID = 'biodata-print-style';

const BIODATA_PRINT_CSS = `
  @media print {
    @page {
      size: A4 portrait;
      margin: 4mm;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: auto !important;
      overflow: visible !important;
      background: #ffffff !important;
    }

    body.biodata-print-active > :not(#biodata-print-root) {
      display: none !important;
    }

    #biodata-print-root {
      display: block !important;
      position: relative !important;
      left: auto !important;
      top: auto !important;
      width: 100% !important;
      max-width: 100% !important;
      min-height: 0 !important;
      height: auto !important;
      margin: 0 auto !important;
      overflow: visible !important;
      box-shadow: none !important;
      background: #ffffff !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    #biodata-print-root,
    #biodata-print-root * {
      overflow: visible !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    #biodata-print-logo img {
      display: block !important;
      opacity: 1 !important;
      visibility: visible !important;
    }

    #biodata-action-bar {
      display: none !important;
    }

    body.biodata-print-hindu #biodata-print-root {
      border: 2px solid #570000 !important;
      border-radius: 0 !important;
      zoom: 0.68;
    }

    body.biodata-print-hindu #biodata-print-charts {
      display: flex !important;
      flex-direction: row !important;
      align-items: stretch !important;
      gap: 6px !important;
    }

    body.biodata-print-hindu #biodata-print-chart-rasi,
    body.biodata-print-hindu #biodata-print-chart-amsam {
      flex: 1 1 0 !important;
      min-width: 0 !important;
      max-width: 50% !important;
    }

    body.biodata-print-hindu #biodata-print-horoscope-footer {
      box-shadow: none !important;
      border-radius: 0 !important;
    }

    body.biodata-print-christian #biodata-print-root {
      display: flex !important;
      flex-direction: column !important;
      min-height: 277mm !important;
      height: 277mm !important;
      border: 2px solid #570000 !important;
      border-radius: 0 !important;
      background: #ffffff !important;
    }

    body.biodata-print-christian #biodata-print-christian-body {
      flex: 1 1 auto !important;
      min-height: 0 !important;
      max-height: none !important;
      height: auto !important;
      overflow: visible !important;
    }

    body.biodata-print-christian #biodata-print-christian-body > div {
      height: 100% !important;
      min-height: 100% !important;
      max-height: none !important;
      overflow: visible !important;
      display: flex !important;
      flex-direction: column !important;
    }

    body.biodata-print-christian #biodata-print-christian-body-row {
      display: flex !important;
      flex-direction: row !important;
      align-items: stretch !important;
      flex: 1 1 auto !important;
      min-height: 235mm !important;
      height: 100% !important;
    }

    body.biodata-print-christian #biodata-print-christian-left-pane,
    body.biodata-print-christian #biodata-print-christian-right-pane {
      display: flex !important;
      flex-direction: column !important;
      flex: 1 1 0 !important;
      min-height: 100% !important;
      height: 100% !important;
    }

    body.biodata-print-christian #biodata-print-christian-left-pane > div {
      flex: 1 1 0 !important;
      min-height: 36px !important;
    }

    body.biodata-print-christian #biodata-print-christian-right-pane > div:nth-child(1),
    body.biodata-print-christian #biodata-print-christian-right-pane > div:nth-child(2) {
      flex: 1 1 0 !important;
      min-height: 52px !important;
      height: auto !important;
    }

    body.biodata-print-christian #biodata-print-christian-right-pane > div:nth-child(3),
    body.biodata-print-christian #biodata-print-christian-right-pane > div:nth-child(4) {
      flex: 1.65 1 0 !important;
      min-height: 100px !important;
    }

    body.biodata-print-christian #biodata-print-christian-footer {
      flex-shrink: 0 !important;
      margin-top: auto !important;
      padding-top: 14px !important;
      padding-bottom: 18px !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    body.biodata-print-christian #biodata-print-christian-footer * {
      line-height: 22px !important;
      overflow: visible !important;
    }
  }
`;

function ensureBiodataPrintStyles(): void {
  if (typeof document === 'undefined') {
    return;
  }

  let style = document.getElementById(BIODATA_PRINT_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = BIODATA_PRINT_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = BIODATA_PRINT_CSS;
}

function printBiodataSheetWeb(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const printRoot = document.getElementById('biodata-print-root');
  if (!printRoot) {
    return;
  }

  ensureBiodataPrintStyles();
  window.scrollTo(0, 0);

  const placeholder = document.createComment('biodata-print-anchor');
  const originalParent = printRoot.parentNode;
  if (!originalParent) {
    window.print();
    return;
  }

  originalParent.insertBefore(placeholder, printRoot);
  document.body.appendChild(printRoot);
  document.body.classList.add('biodata-print-active');
  if (printRoot.querySelector('#biodata-print-christian-body')) {
    document.body.classList.add('biodata-print-christian');
  } else {
    document.body.classList.add('biodata-print-hindu');
  }

  const restore = () => {
    document.body.classList.remove('biodata-print-active');
    document.body.classList.remove('biodata-print-christian');
    document.body.classList.remove('biodata-print-hindu');
    if (printRoot.parentNode === document.body && originalParent) {
      originalParent.insertBefore(printRoot, placeholder);
      originalParent.removeChild(placeholder);
    }
  };

  const cleanup = () => {
    window.removeEventListener('afterprint', cleanup);
    window.clearTimeout(fallbackTimer);
    restore();
  };

  const fallbackTimer = window.setTimeout(cleanup, 6000);
  window.addEventListener('afterprint', cleanup, { once: true });

  requestAnimationFrame(() => {
    window.print();
  });
}

function createDefaultDetailGrid(): string[] {
  return Array.from({ length: DETAIL_GRID_COUNT }, (_, index) => String(index + 1));
}

function normalizeDetailGridInput(text: string): string {
  const digits = text.replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  const num = Number(digits);
  if (num > 33) {
    return '33';
  }
  return String(num);
}

const HOROSCOPE_PLANETS = [
  { value: 'surya', label: 'சூ' },
  { value: 'chandra', label: 'சந்' },
  { value: 'mars', label: 'செ' },
  { value: 'mercury', label: 'பு' },
  { value: 'jupiter', label: 'கு' },
  { value: 'venus', label: 'சுக்' },
  { value: 'saturn', label: 'சனி' },
  { value: 'rahu', label: 'ரா' },
  { value: 'kethu', label: 'கே' },
  { value: 'lagna', label: 'ல' },
] as const;

function resolveHoroscopeCellValue(stored: string): string {
  const trimmed = stored.trim();
  if (!trimmed) {
    return '';
  }

  const byValue = HOROSCOPE_PLANETS.find((planet) => planet.value === trimmed);
  if (byValue) {
    return byValue.value;
  }

  const byLabel = HOROSCOPE_PLANETS.find((planet) => planet.label === trimmed);
  return byLabel?.value ?? trimmed;
}

function getHoroscopeCellLabel(stored: string): string {
  const resolved = resolveHoroscopeCellValue(stored);
  const planet = HOROSCOPE_PLANETS.find((item) => item.value === resolved);
  return planet?.label ?? stored;
}

type BiodataState = {
  fullName: string;
  gender: string;
  education: string;
  dateOfBirth: string;
  birthTiming: string;
  natchathiram: string;
  rasi: string;
  lagnam: string;
  occupation: string;
  occupationType: string;
  occupationDesignation: string;
  monthlyIncome: string;
  propertyDetails: string;
  propertyHouseType: string;
  propertyHouseCount: string;
  fatherName: string;
  motherName: string;
  irupidam: string;
  totalFamilyMembers: string;
  birthOrder: string;
  marriedBrother: string;
  marriedYoungerBrother: string;
  marriedSister: string;
  marriedYoungerSister: string;
  unmarriedBrother: string;
  unmarriedYoungerBrother: string;
  unmarriedSister: string;
  unmarriedYoungerSister: string;
  complexion: string;
  height: string;
  seervarisai: string;
  dasaBalance: string;
  dasaYear: string;
  dasaMonth: string;
  dasaDay: string;
  registrationNumber: string;
  numSiblings: string;
  maritalStatus: string;
  livingStatus: string;
  eatingHabits: string;
  birthOrderRelation: string;
};

function generateRegistrationNumber(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function normalizeRegistrationNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  return digits.slice(-4);
}

function sanitizeRegistrationInput(text: string): string {
  return text.replace(/\D/g, '').slice(0, 4);
}

export function RegistrationNumberBar({
  editable,
  inline = false,
}: {
  editable: boolean;
  inline?: boolean;
}) {
  const { translate } = useLanguage();
  const { getValue, setValue, isReady } = useProfileForm();
  const [registrationNumber, setRegistrationNumber] = useState('');

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const storedRegistration = getValue('registrationNumber').trim();
    const normalizedRegistration = normalizeRegistrationNumber(storedRegistration);
    const nextRegistration = normalizedRegistration || generateRegistrationNumber();
    if (!normalizedRegistration || normalizedRegistration !== storedRegistration) {
      setValue('registrationNumber', nextRegistration);
    }
    setRegistrationNumber(nextRegistration);
  }, [getValue, isReady, setValue]);

  const handleChange = useCallback(
    (text: string) => {
      const digits = sanitizeRegistrationInput(text);
      setRegistrationNumber(digits);
      setValue('registrationNumber', digits);
    },
    [setValue],
  );

  const registrationInputProps = {
    value: registrationNumber,
    onChangeText: handleChange,
    editable,
    placeholderTextColor: PLACEHOLDER,
    keyboardType: 'number-pad' as const,
    maxLength: 4,
  };

  return (
    <View style={[registrationHeaderStyles.wrap, inline && registrationHeaderStyles.wrapInline]}>
      <View style={[registrationHeaderStyles.card, inline && registrationHeaderStyles.cardInline]}>
        <Text
          style={[registrationHeaderStyles.label, inline && registrationHeaderStyles.labelInline]}
          numberOfLines={1}
        >
          {translate(inline ? 'biodataRegistrationNumberShort' : 'biodataRegistrationNumber')}
        </Text>
        {inline ? (
          <TextInput
            style={registrationHeaderStyles.inputInline}
            {...registrationInputProps}
            numberOfLines={1}
          />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={registrationHeaderStyles.scroll}
          >
            <TextInput
              style={registrationHeaderStyles.input}
              {...registrationInputProps}
            />
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const registrationHeaderStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: 2,
    paddingBottom: 2,
  },
  wrapInline: {
    flexShrink: 0,
    alignItems: 'stretch',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF0ED',
    borderRadius: borderRadius.md,
    paddingVertical: 5,
    paddingHorizontal: 10,
    width: '100%',
    maxWidth: 360,
  },
  cardInline: {
    flexShrink: 0,
    gap: 3,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.1)',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(87, 0, 0, 0.06)' },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },
  label: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: fonts.interSemi,
    flexShrink: 0,
  },
  labelInline: {
    fontSize: 10,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  input: {
    width: 52,
    minHeight: 28,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    color: colors.onSurface,
    fontSize: 12,
    fontFamily: fonts.interSemi,
    textAlign: 'center',
  },
  inputInline: {
    width: 52,
    flexGrow: 0,
    flexShrink: 0,
    minHeight: 26,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.12)',
    color: colors.onSurface,
    fontSize: 11,
    fontFamily: fonts.interSemi,
    textAlign: 'center',
  },
});

function emptyHoroscope(): string[][] {
  return Array.from({ length: HOROSCOPE_SIZE }, () =>
    Array.from({ length: HOROSCOPE_SIZE }, () => ''),
  );
}

function parseHoroscope(raw: string | undefined): string[][] {
  if (!raw) {
    return emptyHoroscope();
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return emptyHoroscope();
    }
    return Array.from({ length: HOROSCOPE_SIZE }, (_, row) =>
      Array.from({ length: HOROSCOPE_SIZE }, (_, col) => {
        const rowValue = parsed[row];
        if (!Array.isArray(rowValue)) {
          return '';
        }
        return typeof rowValue[col] === 'string' ? rowValue[col] : '';
      }),
    );
  } catch {
    return emptyHoroscope();
  }
}

function parseDetailGrid(raw: string | undefined): string[] {
  if (!raw) {
    return createDefaultDetailGrid();
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return createDefaultDetailGrid();
    }
    return Array.from({ length: DETAIL_GRID_COUNT }, (_, index) =>
      typeof parsed[index] === 'string' ? parsed[index] : String(index + 1),
    );
  } catch {
    return createDefaultDetailGrid();
  }
}

const cardShadow = Platform.select({
  web: {
    boxShadow: '0 8px 32px rgba(87, 0, 0, 0.1)',
  },
  default: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
  },
});

const actionBarShadow = Platform.select({
  web: {
    boxShadow: '0 -4px 20px rgba(87, 0, 0, 0.08)',
  },
  default: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
});

function resolveStoredOptionValue(
  optionsKey: FormOptionsKey,
  stored: string,
  language: Language,
): string {
  const trimmed = stored.trim();
  if (!trimmed) {
    return '';
  }

  const options = getFormOptions(optionsKey, language);
  if (options.some((option) => option.value === trimmed)) {
    return trimmed;
  }

  const exactLabel = options.find(
    (option) => option.label.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exactLabel) {
    return exactLabel.value;
  }

  const looseLabel = options.find(
    (option) =>
      option.label.toLowerCase().includes(trimmed.toLowerCase()) ||
      trimmed.toLowerCase().includes(option.label.toLowerCase()),
  );
  return looseLabel?.value ?? trimmed;
}

function SectionCard({ children, dense }: { children: ReactNode; dense?: boolean }) {
  return <View style={[styles.sectionCard, dense && styles.sectionCardDense]}>{children}</View>;
}

function IconFieldShell({
  icon,
  children,
  dense,
  onIconPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  children: ReactNode;
  dense?: boolean;
  onIconPress?: () => void;
}) {
  const badge = (
    <View style={[styles.iconFieldBadge, dense && styles.iconFieldBadgeDense]}>
      <MaterialIcons name={icon} size={dense ? 11 : 13} color={colors.primary} />
    </View>
  );

  return (
    <View style={[styles.iconFieldShell, dense && styles.iconFieldShellDense]}>
      {onIconPress ? (
        <Pressable
          onPress={onIconPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Choose date"
          style={({ pressed }) => [pressed && styles.iconFieldBadgePressed]}
        >
          {badge}
        </Pressable>
      ) : (
        badge
      )}
      <View style={styles.iconFieldBody}>{children}</View>
    </View>
  );
}

function BiodataSelectRow({
  label,
  value,
  onValueChange,
  optionsKey,
  editable,
  dense,
  placeholder,
  icon,
  narrow,
  hideLabel,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  optionsKey: FormOptionsKey;
  editable: boolean;
  dense?: boolean;
  placeholder?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  narrow?: boolean;
  hideLabel?: boolean;
}) {
  const { language } = useLanguage();
  const options = useMemo(() => getFormOptions(optionsKey, language), [optionsKey, language]);
  const resolvedValue = useMemo(
    () => resolveStoredOptionValue(optionsKey, value, language),
    [language, optionsKey, value],
  );

  if (!editable) {
    const display = getOptionLabel(optionsKey, resolvedValue, language, value);
    return (
      <View style={[styles.fieldGroup, dense && styles.fieldGroupDense, narrow && styles.fieldGroupNarrow]}>
        {hideLabel ? null : (
          <Text
            style={[styles.fieldLabel, dense && styles.fieldLabelDense, narrow && styles.fieldLabelNarrow]}
            numberOfLines={1}
          >
            {label}
          </Text>
        )}
        <View style={[styles.fieldInput, styles.fieldInputReadonly, dense && styles.fieldInputDense]}>
          <Text style={styles.fieldReadonlyText} numberOfLines={1}>
            {display || '—'}
          </Text>
        </View>
      </View>
    );
  }

  const selectField = (
    <SelectField
      label={label}
      value={resolvedValue}
      onValueChange={onValueChange}
      options={options}
      placeholder={placeholder}
      showLabel={false}
      compact
      variant="premium"
      embedded
      tight={narrow}
    />
  );

  return (
    <View
      style={[
        styles.fieldGroup,
        dense && styles.fieldGroupDense,
        styles.selectFieldGroup,
        narrow && styles.fieldGroupNarrow,
      ]}
    >
      {hideLabel ? null : (
        <Text
          style={[styles.fieldLabel, dense && styles.fieldLabelDense, narrow && styles.fieldLabelNarrow]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {label}
        </Text>
      )}
      {narrow ? (
        <View style={[styles.narrowSelectShell, dense && styles.narrowSelectShellDense]}>{selectField}</View>
      ) : (
        <IconFieldShell icon={icon ?? 'expand-more'} dense={dense}>
          {selectField}
        </IconFieldShell>
      )}
    </View>
  );
}

function BiodataOccupationFields({
  occupationType,
  occupation,
  occupationDesignation,
  onTypeChange,
  onOccupationChange,
  onDesignationChange,
  editable,
  dense,
}: {
  occupationType: string;
  occupation: string;
  occupationDesignation: string;
  onTypeChange: (value: string) => void;
  onOccupationChange: (value: string) => void;
  onDesignationChange: (value: string) => void;
  editable: boolean;
  dense?: boolean;
}) {
  const { language, translate } = useLanguage();

  const handleOccupationChange = useCallback(
    (value: string) => {
      onTypeChange(value);
      if (!value) {
        onOccupationChange('');
        onDesignationChange('');
      }
    },
    [onDesignationChange, onOccupationChange, onTypeChange],
  );

  const handleRoleChange = useCallback(
    (value: string) => {
      onOccupationChange(value);
      if (!value) {
        onDesignationChange('');
      }
    },
    [onDesignationChange, onOccupationChange],
  );

  if (!editable) {
    const occupationDisplay = getOptionLabel('occupationType', occupationType, language, occupationType);
    const roleDisplay = getOptionLabel('occupation', occupation, language, occupation);
    return (
      <View style={[styles.fieldGroup, dense && styles.fieldGroupDense]}>
        <Text style={[styles.fieldLabel, dense && styles.fieldLabelDense]}>
          {translate('biodataFieldOccupation')}
        </Text>
        <View style={[styles.fieldInput, styles.fieldInputReadonly, dense && styles.fieldInputDense]}>
          <Text style={styles.fieldReadonlyText}>
            {[occupationDisplay, roleDisplay, occupationDesignation.trim()].filter(Boolean).join(' · ') || '—'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.occupationFieldsWrap}>
      <View style={styles.fieldPairRow}>
        <View style={styles.fieldPairItem}>
          <BiodataSelectRow
            label={translate('biodataOccupationMain')}
            value={occupationType}
            onValueChange={handleOccupationChange}
            optionsKey="occupationType"
            editable={editable}
            dense={dense}
            placeholder={translate('selectOccupationType')}
            icon="work"
          />
        </View>
        <View style={styles.fieldPairItem}>
          <BiodataSelectRow
            label={translate('biodataOccupationRole')}
            value={occupation}
            onValueChange={handleRoleChange}
            optionsKey="occupation"
            editable={editable}
            dense={dense}
            placeholder={translate('selectOccupationRole')}
            icon="badge"
          />
        </View>
      </View>
    </View>
  );
}

function BottomSheetModal({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.bottomSheetRoot}>
        <Pressable style={styles.bottomSheetBackdrop} onPress={onClose} />
        <View style={styles.bottomSheetCard}>
          <View style={styles.bottomSheetHandle} />
          {title ? <Text style={styles.bottomSheetTitle}>{title}</Text> : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}

function DasaBalanceFields({
  dasaBalance,
  dasaYear,
  dasaMonth,
  dasaDay,
  onFieldChange,
  editable,
  dense,
}: {
  dasaBalance: string;
  dasaYear: string;
  dasaMonth: string;
  dasaDay: string;
  onFieldChange: (field: 'dasaBalance' | 'dasaYear' | 'dasaMonth' | 'dasaDay', value: string) => void;
  editable: boolean;
  dense?: boolean;
}) {
  const { language, translate } = useLanguage();

  const planetOptions = useMemo(() => getFormOptions('dasaPlanet', language), [language]);
  const yearOptions = useMemo(() => getFormOptions('dasaYear', language), [language]);
  const monthOptions = useMemo(() => getFormOptions('dasaMonth', language), [language]);
  const dayOptions = useMemo(() => getFormOptions('dasaDay', language), [language]);

  const resolvedPlanet = useMemo(
    () => resolveStoredOptionValue('dasaPlanet', dasaBalance, language),
    [dasaBalance, language],
  );
  const resolvedYear = useMemo(
    () => resolveStoredOptionValue('dasaYear', dasaYear, language),
    [dasaYear, language],
  );
  const resolvedMonth = useMemo(
    () => resolveStoredOptionValue('dasaMonth', dasaMonth, language),
    [dasaMonth, language],
  );
  const resolvedDay = useMemo(
    () => resolveStoredOptionValue('dasaDay', dasaDay, language),
    [dasaDay, language],
  );

  if (!editable) {
    return (
      <View style={[styles.dasaBalanceRow, dense && styles.dasaBalanceRowDense]}>
        <Text style={[styles.dasaBalanceTitle, dense && styles.dasaBalanceTitleDense]} numberOfLines={1}>
          {translate('biodataDasaBalanceShort')}
        </Text>
        <Text style={[styles.dasaReadonlyValue, dense && styles.dasaReadonlyValueDense]} numberOfLines={1}>
          {getOptionLabel('dasaPlanet', resolvedPlanet, language, dasaBalance) || '—'}
        </Text>
        <Text style={[styles.dasaReadonlyValue, dense && styles.dasaReadonlyValueDense]} numberOfLines={1}>
          {getOptionLabel('dasaYear', resolvedYear, language, dasaYear) || '—'}
        </Text>
        <Text style={[styles.dasaReadonlyValue, dense && styles.dasaReadonlyValueDense]} numberOfLines={1}>
          {getOptionLabel('dasaMonth', resolvedMonth, language, dasaMonth) || '—'}
        </Text>
        <Text style={[styles.dasaReadonlyValue, dense && styles.dasaReadonlyValueDense]} numberOfLines={1}>
          {getOptionLabel('dasaDay', resolvedDay, language, dasaDay) || '—'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.dasaBalanceRow, dense && styles.dasaBalanceRowDense]}>
      <Text style={[styles.dasaBalanceTitle, dense && styles.dasaBalanceTitleDense]} numberOfLines={1}>
        {translate('biodataDasaBalanceShort')}
      </Text>
      <View style={[styles.dasaInlineSelect, styles.dasaPlanetSelectWrap, styles.selectFieldGroup]}>
        <SelectField
          label={translate('biodataDasaBalance')}
          value={resolvedPlanet}
          onValueChange={(value) => onFieldChange('dasaBalance', value)}
          options={planetOptions}
          placeholder={translate('selectDasaPlanet')}
          showLabel={false}
          compact
          variant="premium"
          embedded
        />
      </View>
      <View style={styles.dasaDateField}>
        <Text style={[styles.dasaDatePrefix, dense && styles.dasaDatePrefixDense]} numberOfLines={1}>
          {translate('selectDasaYear')}
        </Text>
        <View style={[styles.dasaInlineSelect, styles.dasaYearSelectWrap, styles.selectFieldGroup]}>
          <SelectField
            label={translate('biodataYear')}
            value={resolvedYear}
            onValueChange={(value) => onFieldChange('dasaYear', value)}
            options={yearOptions}
            placeholder="—"
            showLabel={false}
            compact
            variant="premium"
            embedded
            tight
          />
        </View>
      </View>
      <View style={styles.dasaDateField}>
        <Text style={[styles.dasaDatePrefix, dense && styles.dasaDatePrefixDense]} numberOfLines={1}>
          {translate('selectDasaMonth')}
        </Text>
        <View style={[styles.dasaInlineSelect, styles.dasaMonthSelectWrap, styles.selectFieldGroup]}>
          <SelectField
            label={translate('biodataMonth')}
            value={resolvedMonth}
            onValueChange={(value) => onFieldChange('dasaMonth', value)}
            options={monthOptions}
            placeholder="—"
            showLabel={false}
            compact
            variant="premium"
            embedded
            tight
          />
        </View>
      </View>
      <View style={styles.dasaDateField}>
        <Text style={[styles.dasaDatePrefix, dense && styles.dasaDatePrefixDense]} numberOfLines={1}>
          {translate('selectDasaDay')}
        </Text>
        <View style={[styles.dasaInlineSelect, styles.dasaDaySelectWrap, styles.selectFieldGroup]}>
          <SelectField
            label={translate('biodataDay')}
            value={resolvedDay}
            onValueChange={(value) => onFieldChange('dasaDay', value)}
            options={dayOptions}
            placeholder="—"
            showLabel={false}
            compact
            variant="premium"
            embedded
            tight
          />
        </View>
      </View>
    </View>
  );
}

function formatBiodataDateDigits(digits: string): string {
  const normalized = digits.replace(/\D/g, '').slice(0, 8);
  if (!normalized) {
    return '';
  }
  if (normalized.length <= 2) {
    return normalized;
  }
  if (normalized.length <= 4) {
    return `${normalized.slice(0, 2)} / ${normalized.slice(2)}`;
  }
  return `${normalized.slice(0, 2)} / ${normalized.slice(2, 4)} / ${normalized.slice(4)}`;
}

function normalizeBiodataDateValue(digits: string): string {
  if (digits.length < 8) {
    return formatBiodataDateDigits(digits);
  }

  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));

  if (!day || !month || !year) {
    return formatBiodataDateDigits(digits);
  }

  return `${String(day).padStart(2, '0')} / ${String(month).padStart(2, '0')} / ${year}`;
}

const MIN_MATRIMONY_AGE = 18;
const MAX_MATRIMONY_AGE = 65;

function getBirthDateLimits() {
  const today = new Date();
  const maximumDate = new Date(today);
  maximumDate.setFullYear(today.getFullYear() - MIN_MATRIMONY_AGE);
  const minimumDate = new Date(today);
  minimumDate.setFullYear(today.getFullYear() - MAX_MATRIMONY_AGE);
  return { minimumDate, maximumDate };
}

function parseBiodataDate(value: string): Date | null {
  const parts = value.split('/').map((part) => part.trim());
  if (parts.length !== 3) {
    return null;
  }

  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = Number(parts[2]);

  if (!day || !month || !year) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatBiodataDateFromDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')} / ${String(date.getMonth() + 1).padStart(2, '0')} / ${date.getFullYear()}`;
}

function toWebDateInputValue(value: string): string {
  const parsed = parseBiodataDate(value);
  if (!parsed) {
    return '';
  }

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
}

function fromWebDateInputValue(value: string): string {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) {
    return '';
  }
  return `${day} / ${month} / ${year}`;
}

function formatBiodataTimeDigits(digits: string): string {
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)} : ${digits.slice(2)}`;
}

function normalizeBiodataTimeValue(digits: string): string {
  if (digits.length < 4) {
    return formatBiodataTimeDigits(digits);
  }

  const hour = Number(digits.slice(0, 2));
  const minute = Number(digits.slice(2, 4));
  if (hour > 23 || minute > 59) {
    return formatBiodataTimeDigits(digits);
  }

  return `${String(hour).padStart(2, '0')} : ${String(minute).padStart(2, '0')}`;
}

function parseBiodataTime(value: string): Date | null {
  const match = value.trim().match(/^(\d{1,2})\s*:\s*(\d{2})$/);
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) {
    return null;
  }

  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

function formatBiodataTimeFromDate(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')} : ${String(date.getMinutes()).padStart(2, '0')}`;
}

function toWebTimeInputValue(value: string): string {
  const parsed = parseBiodataTime(value);
  if (!parsed) {
    return '';
  }

  return `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`;
}

function fromWebTimeInputValue(value: string): string {
  const [hour, minute] = value.split(':');
  if (!hour || !minute) {
    return '';
  }
  return `${hour} : ${minute}`;
}

function BiodataDateRow({
  label,
  value,
  onValueChange,
  editable,
  dense,
  icon,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  editable: boolean;
  dense?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  placeholder?: string;
  required?: boolean;
}) {
  const { translate } = useLanguage();
  const webDateInputRef = useRef<HTMLInputElement | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const { minimumDate, maximumDate } = useMemo(() => getBirthDateLimits(), []);
  const [pickerDate, setPickerDate] = useState(() => parseBiodataDate(value) ?? maximumDate);

  useEffect(() => {
    const parsed = parseBiodataDate(value);
    if (parsed) {
      setPickerDate(parsed);
    }
  }, [value]);

  const handleDateChange = useCallback(
    (text: string) => {
      const digits = text.replace(/\D/g, '').slice(0, 8);
      onValueChange(normalizeBiodataDateValue(digits));
    },
    [onValueChange],
  );

  const applyPickedDate = useCallback(
    (date: Date) => {
      onValueChange(formatBiodataDateFromDate(date));
      setPickerDate(date);
    },
    [onValueChange],
  );

  const openDatePicker = useCallback(() => {
    if (Platform.OS === 'web') {
      const input = webDateInputRef.current;
      if (!input) {
        return;
      }
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        input.click();
      }
      return;
    }

    setPickerDate(parseBiodataDate(value) ?? maximumDate);
    setShowPicker(true);
  }, [maximumDate, value]);

  const handleNativePickerChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }

      if (event.type === 'dismissed' || !date) {
        if (Platform.OS === 'ios') {
          setShowPicker(false);
        }
        return;
      }

      applyPickedDate(date);
      if (Platform.OS === 'ios') {
        setShowPicker(false);
      }
    },
    [applyPickedDate],
  );

  const labelNode = (
    <Text style={[styles.fieldLabel, dense && styles.fieldLabelDense]}>
      {label}
      {required ? <Text style={styles.requiredMark}> *</Text> : null}
    </Text>
  );

  if (!editable) {
    return (
      <View style={[styles.fieldGroup, dense && styles.fieldGroupDense]}>
        {labelNode}
        <View style={[styles.fieldInput, styles.fieldInputReadonly, dense && styles.fieldInputDense]}>
          <Text style={styles.fieldReadonlyText}>{value || '—'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.fieldGroup, dense && styles.fieldGroupDense]}>
      {labelNode}
      <View style={[styles.dateFieldShell, dense && styles.dateFieldShellDense]}>
        <TextInput
          style={[styles.dateFieldInput, dense && styles.dateFieldInputDense]}
          value={value}
          onChangeText={handleDateChange}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor={PLACEHOLDER}
          keyboardType="number-pad"
          maxLength={14}
        />
        <Pressable
          onPress={openDatePicker}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={translate('biodataFieldDateOfBirth')}
          style={({ pressed }) => [
            styles.dateFieldIconButton,
            dense && styles.dateFieldIconButtonDense,
            pressed && styles.iconFieldBadgePressed,
          ]}
        >
          <MaterialIcons
            name={icon ?? 'calendar-today'}
            size={dense ? 16 : 18}
            color={colors.primary}
          />
        </Pressable>
      </View>
      {Platform.OS === 'web'
        ? createElement('input', {
            ref: webDateInputRef,
            type: 'date',
            value: toWebDateInputValue(value),
            min: toWebDateInputValue(formatBiodataDateFromDate(minimumDate)),
            max: toWebDateInputValue(formatBiodataDateFromDate(maximumDate)),
            onChange: (event: { target: { value: string } }) => {
              const nextValue = fromWebDateInputValue(event.target.value);
              if (nextValue) {
                onValueChange(nextValue);
              }
            },
            style: {
              position: 'absolute',
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: 'none',
            },
          })
        : null}
      {showPicker && Platform.OS === 'ios' ? (
        <Modal transparent animationType="slide" visible onRequestClose={() => setShowPicker(false)}>
          <Pressable style={styles.datePickerOverlay} onPress={() => setShowPicker(false)}>
            <Pressable style={styles.datePickerSheet} onPress={(event) => event.stopPropagation()}>
              <DateTimePicker
                value={pickerDate}
                mode="date"
                display="spinner"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onChange={(_, date) => {
                  if (date) {
                    setPickerDate(date);
                  }
                }}
              />
              <Pressable style={styles.datePickerDoneBtn} onPress={() => applyPickedDate(pickerDate)}>
                <Text style={styles.datePickerDoneText}>{translate('ok')}</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
      {showPicker && Platform.OS === 'android' ? (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleNativePickerChange}
        />
      ) : null}
    </View>
  );
}

function BiodataTimeRow({
  label,
  value,
  onValueChange,
  editable,
  dense,
  placeholder,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  editable: boolean;
  dense?: boolean;
  placeholder?: string;
}) {
  const { translate } = useLanguage();
  const webTimeInputRef = useRef<HTMLInputElement | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTime, setPickerTime] = useState(() => parseBiodataTime(value) ?? new Date());

  useEffect(() => {
    const parsed = parseBiodataTime(value);
    if (parsed) {
      setPickerTime(parsed);
    }
  }, [value]);

  const handleTimeChange = useCallback(
    (text: string) => {
      const digits = text.replace(/\D/g, '').slice(0, 4);
      onValueChange(normalizeBiodataTimeValue(digits));
    },
    [onValueChange],
  );

  const applyPickedTime = useCallback(
    (date: Date) => {
      onValueChange(formatBiodataTimeFromDate(date));
      setPickerTime(date);
    },
    [onValueChange],
  );

  const openTimePicker = useCallback(() => {
    if (Platform.OS === 'web') {
      const input = webTimeInputRef.current;
      if (!input) {
        return;
      }
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        input.click();
      }
      return;
    }

    setPickerTime(parseBiodataTime(value) ?? new Date());
    setShowPicker(true);
  }, [value]);

  const handleNativePickerChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }

      if (event.type === 'dismissed' || !date) {
        if (Platform.OS === 'ios') {
          setShowPicker(false);
        }
        return;
      }

      applyPickedTime(date);
      if (Platform.OS === 'ios') {
        setShowPicker(false);
      }
    },
    [applyPickedTime],
  );

  if (!editable) {
    return (
      <View style={[styles.fieldGroup, dense && styles.fieldGroupDense]}>
        <Text style={[styles.fieldLabel, dense && styles.fieldLabelDense]}>{label}</Text>
        <View style={[styles.fieldInput, styles.fieldInputReadonly, dense && styles.fieldInputDense]}>
          <Text style={styles.fieldReadonlyText}>{value || '—'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.fieldGroup, dense && styles.fieldGroupDense]}>
      <Text style={[styles.fieldLabel, dense && styles.fieldLabelDense]}>{label}</Text>
      <View style={[styles.dateFieldShell, dense && styles.dateFieldShellDense]}>
        <TextInput
          style={[styles.dateFieldInput, dense && styles.dateFieldInputDense]}
          value={value}
          onChangeText={handleTimeChange}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor={PLACEHOLDER}
          keyboardType="number-pad"
          maxLength={8}
        />
        <Pressable
          onPress={openTimePicker}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={({ pressed }) => [
            styles.dateFieldIconButton,
            dense && styles.dateFieldIconButtonDense,
            pressed && styles.iconFieldBadgePressed,
          ]}
        >
          <MaterialIcons name="access-time" size={dense ? 16 : 18} color={colors.primary} />
        </Pressable>
      </View>
      {Platform.OS === 'web'
        ? createElement('input', {
            ref: webTimeInputRef,
            type: 'time',
            value: toWebTimeInputValue(value),
            onChange: (event: { target: { value: string } }) => {
              const nextValue = fromWebTimeInputValue(event.target.value);
              if (nextValue) {
                onValueChange(nextValue);
              }
            },
            style: {
              position: 'absolute',
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: 'none',
            },
          })
        : null}
      {showPicker && Platform.OS === 'ios' ? (
        <Modal transparent animationType="slide" visible onRequestClose={() => setShowPicker(false)}>
          <Pressable style={styles.datePickerOverlay} onPress={() => setShowPicker(false)}>
            <Pressable style={styles.datePickerSheet} onPress={(event) => event.stopPropagation()}>
              <DateTimePicker
                value={pickerTime}
                mode="time"
                display="spinner"
                onChange={(_, date) => {
                  if (date) {
                    setPickerTime(date);
                  }
                }}
              />
              <Pressable style={styles.datePickerDoneBtn} onPress={() => applyPickedTime(pickerTime)}>
                <Text style={styles.datePickerDoneText}>{translate('ok')}</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
      {showPicker && Platform.OS === 'android' ? (
        <DateTimePicker value={pickerTime} mode="time" display="default" onChange={handleNativePickerChange} />
      ) : null}
    </View>
  );
}

function BiodataNameDegreeRow({
  label,
  nameValue,
  degreeValue,
  onNameChange,
  onDegreeChange,
  editable,
  dense,
  namePlaceholder,
  degreePlaceholder,
}: {
  label: string;
  nameValue: string;
  degreeValue: string;
  onNameChange: (text: string) => void;
  onDegreeChange: (value: string) => void;
  editable: boolean;
  dense?: boolean;
  namePlaceholder?: string;
  degreePlaceholder?: string;
}) {
  const { language } = useLanguage();
  const degreeOptions = useMemo(() => getFormOptions('degreeDetail', language), [language]);
  const resolvedDegree = useMemo(
    () => resolveStoredOptionValue('degreeDetail', degreeValue, language),
    [degreeValue, language],
  );

  if (!editable) {
    const degreeDisplay = getOptionLabel('degreeDetail', resolvedDegree, language, degreeValue);
    return (
      <View style={[styles.fieldGroup, dense && styles.fieldGroupDense]}>
        <Text style={[styles.fieldLabel, dense && styles.fieldLabelDense]}>{label}</Text>
        <View style={[styles.fieldInput, styles.fieldInputReadonly, dense && styles.fieldInputDense]}>
          <Text style={styles.fieldReadonlyText}>
            {[nameValue.trim(), degreeDisplay].filter(Boolean).join(' · ') || '—'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.fieldGroup, dense && styles.fieldGroupDense, styles.selectFieldGroup]}>
      <Text style={[styles.fieldLabel, dense && styles.fieldLabelDense]}>{label}</Text>
      <IconFieldShell icon="person" dense={dense}>
        <View style={styles.nameDegreeRow}>
          <TextInput
            style={[
              styles.fieldInput,
              styles.fieldInputWithIcon,
              styles.nameDegreeInput,
              dense && styles.fieldInputDense,
            ]}
            value={nameValue}
            onChangeText={onNameChange}
            editable={editable}
            placeholder={namePlaceholder}
            placeholderTextColor={PLACEHOLDER}
          />
          <View style={styles.nameDegreeDivider} />
          <View style={styles.nameDegreeSelect}>
            <SelectField
              label={label}
              value={resolvedDegree}
              onValueChange={onDegreeChange}
              options={degreeOptions}
              placeholder={degreePlaceholder}
              showLabel={false}
              compact
              variant="premium"
              embedded
            />
          </View>
        </View>
      </IconFieldShell>
    </View>
  );
}

function BiodataRow({
  label,
  value,
  onChangeText,
  editable,
  multiline,
  dense,
  placeholder,
  icon,
  narrow,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  multiline?: boolean;
  dense?: boolean;
  placeholder?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  narrow?: boolean;
}) {
  const input = (
    <TextInput
      style={[
        styles.fieldInput,
        styles.fieldInputWithIcon,
        narrow && styles.narrowFieldInput,
        dense && styles.fieldInputDense,
        multiline && styles.fieldInputMultiline,
        multiline && dense && styles.fieldInputMultilineDense,
        !editable && styles.fieldInputReadonly,
      ]}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      multiline={multiline}
      placeholder={placeholder}
      placeholderTextColor={PLACEHOLDER}
    />
  );

  return (
    <View
      style={[
        styles.fieldGroup,
        dense && styles.fieldGroupDense,
        narrow && styles.fieldGroupNarrow,
      ]}
    >
      <Text
        style={[styles.fieldLabel, dense && styles.fieldLabelDense, narrow && styles.fieldLabelNarrow]}
        numberOfLines={1}
        adjustsFontSizeToFit={narrow}
        minimumFontScale={0.8}
      >
        {label}
      </Text>
      {narrow ? (
        <View style={[styles.narrowSelectShell, dense && styles.narrowSelectShellDense]}>{input}</View>
      ) : icon ? (
        <IconFieldShell icon={icon} dense={dense}>
          {input}
        </IconFieldShell>
      ) : (
        input
      )}
    </View>
  );
}

function SiblingSidebarSection({
  title,
  fieldKeys,
  form,
  onFieldChange,
  editable,
  dense,
}: {
  title: string;
  fieldKeys: {
    elderBrother: keyof BiodataState;
    youngerBrother: keyof BiodataState;
    elderSister: keyof BiodataState;
    youngerSister: keyof BiodataState;
  };
  form: BiodataState;
  onFieldChange: (field: keyof BiodataState, value: string) => void;
  editable: boolean;
  dense?: boolean;
}) {
  const { translate } = useLanguage();
  const rows: Array<{ key: keyof BiodataState; label: string }> = [
    { key: fieldKeys.elderBrother, label: translate('biodataRelationElderBrother') },
    { key: fieldKeys.youngerBrother, label: translate('biodataRelationYoungerBrother') },
    { key: fieldKeys.elderSister, label: translate('biodataRelationElderSister') },
    { key: fieldKeys.youngerSister, label: translate('biodataRelationYoungerSister') },
  ];

  return (
    <View style={[styles.siblingSidebarSection, dense && styles.siblingSidebarSectionDense]}>
      <Text style={[styles.siblingSidebarTitle, dense && styles.siblingSidebarTitleDense]}>{title}</Text>
      {rows.map((row) => (
        <BiodataSelectRow
          key={row.key}
          label={row.label}
          value={String(form[row.key] ?? '')}
          onValueChange={(text) => onFieldChange(row.key, text)}
          optionsKey="siblingCount"
          editable={editable}
          dense={dense}
          narrow
        />
      ))}
    </View>
  );
}

function MetricBox({
  label,
  value,
  onChangeText,
  onValueChange,
  optionsKey,
  placeholder,
  editable,
  dense,
  sidebar,
  registration,
  compactSidebar,
  familyCompact,
}: {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  onValueChange?: (value: string) => void;
  optionsKey?: FormOptionsKey;
  placeholder?: string;
  editable: boolean;
  dense?: boolean;
  sidebar?: boolean;
  registration?: boolean;
  compactSidebar?: boolean;
  familyCompact?: boolean;
}) {
  const { language } = useLanguage();
  const sidebarBoxStyle = compactSidebar
    ? [styles.metricBoxSidebarCompact, dense && styles.metricBoxSidebarCompactDense]
    : familyCompact
      ? [styles.metricBoxFamilyCompact, dense && styles.metricBoxFamilyCompactDense]
      : [sidebar && styles.metricBoxSidebar, dense && sidebar && styles.metricBoxSidebarDense];
  const sidebarLabelStyle = compactSidebar
    ? [styles.metricLabelSidebarCompact, dense && styles.metricLabelSidebarCompactDense]
    : familyCompact
      ? [styles.metricLabelFamilyCompact, dense && styles.metricLabelFamilyCompactDense]
      : [sidebar && styles.metricLabelSidebar, dense && sidebar && styles.metricLabelSidebarDense];
  const sidebarInputStyle = compactSidebar
    ? [styles.metricInputSidebarCompact, dense && styles.metricInputSidebarCompactDense]
    : familyCompact
      ? [styles.metricInputFamilyCompact, dense && styles.metricInputFamilyCompactDense]
      : [sidebar && styles.metricInputSidebar, dense && sidebar && styles.metricInputSidebarDense];

  if (optionsKey) {
    const options = useMemo(() => getFormOptions(optionsKey, language), [language, optionsKey]);
    const resolvedValue = useMemo(
      () => resolveStoredOptionValue(optionsKey, value, language),
      [language, optionsKey, value],
    );

    if (!editable) {
      const display = getOptionLabel(optionsKey, resolvedValue, language, value);
      return (
        <View
          style={[
            styles.metricBox,
            ...sidebarBoxStyle,
            dense && styles.metricBoxDense,
          ]}
        >
          <Text
            style={[
              styles.metricLabel,
              ...sidebarLabelStyle,
              dense && styles.metricLabelDense,
            ]}
            numberOfLines={compactSidebar || sidebar ? 2 : 1}
          >
            {label}
          </Text>
          <Text
            style={[
              styles.metricInput,
              ...sidebarInputStyle,
              dense && styles.metricInputDense,
              styles.fieldReadonlyText,
            ]}
          >
            {display || '—'}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.metricBox,
          ...sidebarBoxStyle,
          dense && styles.metricBoxDense,
          styles.selectFieldGroup,
        ]}
      >
        <Text
          style={[
            styles.metricLabel,
            ...sidebarLabelStyle,
            dense && styles.metricLabelDense,
          ]}
          numberOfLines={compactSidebar || sidebar ? 2 : 1}
        >
          {label}
        </Text>
        <SelectField
          label={label}
          value={resolvedValue}
          onValueChange={onValueChange ?? (() => undefined)}
          options={options}
          placeholder={placeholder}
          showLabel={false}
          compact
          variant="premium"
          embedded
          tight={compactSidebar || familyCompact}
        />
      </View>
    );
  }

  const input = (
    <TextInput
      style={[
        styles.metricInput,
        ...sidebarInputStyle,
        dense && styles.metricInputDense,
        registration && styles.metricInputRegistration,
        registration && dense && styles.metricInputRegistrationDense,
      ]}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      placeholderTextColor={PLACEHOLDER}
    />
  );

  return (
    <View
      style={[
        styles.metricBox,
        ...sidebarBoxStyle,
        dense && styles.metricBoxDense,
        registration && styles.metricBoxRegistration,
      ]}
    >
      <Text
        style={[
          styles.metricLabel,
          ...sidebarLabelStyle,
          dense && styles.metricLabelDense,
        ]}
        numberOfLines={compactSidebar || sidebar ? 2 : 1}
      >
        {label}
      </Text>
      {registration ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regScroll}>
          {input}
        </ScrollView>
      ) : (
        input
      )}
    </View>
  );
}

function RadioOptionGroup({
  label,
  value,
  optionsKey,
  onValueChange,
  editable,
  dense,
  twoColumn,
  threeColumn,
  inlineRow,
  fullWidth,
  familyCompact,
}: {
  label: string;
  value: string;
  optionsKey: FormOptionsKey;
  onValueChange: (value: string) => void;
  editable: boolean;
  dense?: boolean;
  twoColumn?: boolean;
  threeColumn?: boolean;
  inlineRow?: boolean;
  fullWidth?: boolean;
  familyCompact?: boolean;
}) {
  const { language } = useLanguage();
  const options = useMemo(() => getFormOptions(optionsKey, language), [language, optionsKey]);
  const resolvedValue = useMemo(
    () => resolveStoredOptionValue(optionsKey, value, language),
    [language, optionsKey, value],
  );

  if (!editable) {
    const display = getOptionLabel(optionsKey, resolvedValue, language, value);
    return (
      <View style={[styles.radioGroup, dense && styles.radioGroupDense, familyCompact && styles.radioGroupFamilyCompact]}>
        <Text style={[styles.radioGroupLabel, dense && styles.radioGroupLabelDense]}>{label}</Text>
        <Text style={styles.fieldReadonlyText}>{display || '—'}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.radioGroup, dense && styles.radioGroupDense, familyCompact && styles.radioGroupFamilyCompact]}>
      <Text style={[styles.radioGroupLabel, dense && styles.radioGroupLabelDense, familyCompact && styles.radioGroupLabelFamilyCompact]}>{label}</Text>
      <View
        style={[
          styles.radioGrid,
          dense && styles.radioGridDense,
          familyCompact && styles.radioGridFamilyCompact,
          twoColumn && styles.radioGridTwoColumn,
          threeColumn && styles.radioGridThreeColumn,
          inlineRow && styles.radioGridInlineRow,
        ]}
      >
        {options.map((option) => {
          const selected = resolvedValue === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onValueChange(option.value)}
              style={[
                styles.radioChip,
                dense && styles.radioChipDense,
                familyCompact && styles.radioChipFamilyCompact,
                twoColumn && styles.radioChipHalf,
                threeColumn && styles.radioChipThird,
                inlineRow && styles.radioChipInline,
                fullWidth && styles.radioChipFull,
                selected && styles.radioChipSelected,
              ]}
            >
              <View style={[styles.radioDot, dense && styles.radioDotDense, selected && styles.radioDotSelected]} />
              <Text
                style={[
                  styles.radioChipText,
                  dense && styles.radioChipTextDense,
                  threeColumn && styles.radioChipTextThird,
                  fullWidth && styles.radioChipTextFull,
                  selected && styles.radioChipTextSelected,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={!fullWidth}
                minimumFontScale={0.75}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MemberBox({
  title,
  fields,
  editable,
  onChange,
  mobile,
  sidebar,
  countSelect,
}: {
  title: string;
  fields: { key: keyof BiodataState; label: string; value: string }[];
  editable: boolean;
  onChange: (key: keyof BiodataState, value: string) => void;
  mobile?: boolean;
  sidebar?: boolean;
  countSelect?: boolean;
}) {
  const { language } = useLanguage();
  const countOptions = useMemo(() => getFormOptions('siblingCount', language), [language]);

  return (
    <View
      style={[
        styles.memberBox,
        sidebar && styles.memberBoxSidebar,
        mobile && styles.memberBoxMobile,
        sidebar && mobile && styles.memberBoxSidebarMobile,
      ]}
    >
      <Text
        style={[
          styles.memberTitle,
          sidebar && styles.memberTitleSidebar,
          mobile && styles.memberTitleMobile,
          sidebar && mobile && styles.memberTitleSidebarMobile,
        ]}
        numberOfLines={sidebar ? 2 : 1}
      >
        {title}
      </Text>
      {fields.map((field) => (
        <View
          key={field.key}
          style={[styles.memberRow, sidebar && styles.memberRowSidebar]}
        >
          <Text
            style={[
              styles.memberLabel,
              sidebar && styles.memberLabelSidebar,
              mobile && styles.memberLabelMobile,
              sidebar && mobile && styles.memberLabelSidebarMobile,
            ]}
            numberOfLines={sidebar ? 2 : 1}
          >
            {field.label}
          </Text>
          {countSelect && sidebar ? (
            editable ? (
              <View style={[styles.memberSelectWrap, styles.selectFieldGroup]}>
                <SelectField
                  label={field.label}
                  value={resolveStoredOptionValue('siblingCount', field.value, language)}
                  onValueChange={(text) => onChange(field.key, text)}
                  options={countOptions}
                  showLabel={false}
                  compact
                  variant="premium"
                />
              </View>
            ) : (
              <Text
                style={[
                  styles.memberInput,
                  sidebar && styles.memberInputSidebar,
                  mobile && styles.memberInputMobile,
                  sidebar && mobile && styles.memberInputSidebarMobile,
                  styles.fieldReadonlyText,
                ]}
              >
                {getOptionLabel(
                  'siblingCount',
                  resolveStoredOptionValue('siblingCount', field.value, language),
                  language,
                  field.value,
                ) || '—'}
              </Text>
            )
          ) : (
          <TextInput
            style={[
              styles.memberInput,
              sidebar && styles.memberInputSidebar,
              mobile && styles.memberInputMobile,
              sidebar && mobile && styles.memberInputSidebarMobile,
            ]}
            value={field.value}
            onChangeText={(text) => onChange(field.key, text)}
            editable={editable}
            placeholderTextColor={PLACEHOLDER}
          />
          )}
        </View>
      ))}
    </View>
  );
}

function DetailGrid({
  cells,
  editable,
  dense,
  onCellChange,
}: {
  cells: string[];
  editable: boolean;
  dense?: boolean;
  onCellChange: (index: number, value: string) => void;
}) {
  let cellOffset = 0;

  return (
    <View style={styles.detailGridContainer} nativeID="biodata-print-detail-grid">
      <View style={styles.detailGridWrap}>
        <View style={styles.detailGrid}>
          {DETAIL_GRID_ROW_SIZES.map((rowSize, rowIndex) => {
            const rowStart = cellOffset;
            const rowCells = cells.slice(rowStart, rowStart + rowSize);
            cellOffset += rowSize;

            return (
              <View key={rowIndex} style={styles.detailGridRow}>
                {rowCells.map((cell, colIndex) => {
                  const index = rowStart + colIndex;
                  const displayValue = cell || String(index + 1);

                  return (
                    <View
                      key={index}
                      style={[styles.detailCellWrap, dense && styles.detailCellWrapDense]}
                    >
                      {editable ? (
                        <TextInput
                          style={[styles.detailCellInput, dense && styles.detailCellInputDense]}
                          value={cell}
                          onChangeText={(text) => onCellChange(index, normalizeDetailGridInput(text))}
                          editable={editable}
                          keyboardType="number-pad"
                          maxLength={2}
                          textAlign="center"
                          placeholder={String(index + 1)}
                          placeholderTextColor="rgba(87, 0, 0, 0.25)"
                        />
                      ) : (
                        <Text
                          style={[styles.detailCellText, dense && styles.detailCellTextDense]}
                          numberOfLines={1}
                        >
                          {displayValue}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function PickerModal({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.pickerModalRoot}>
        <Pressable style={styles.pickerModalBackdrop} onPress={onClose} />
        <View style={styles.pickerModalCard}>
          {title ? <Text style={styles.pickerModalTitle}>{title}</Text> : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}

function HoroscopeCellPicker({
  value,
  editable,
  compact,
  isOpen,
  onOpen,
  onClose,
  onChange,
}: {
  value: string;
  editable: boolean;
  compact?: boolean;
  row?: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onChange: (value: string) => void;
}) {
  const display = getHoroscopeCellLabel(value);

  if (!editable) {
    return (
      <Text style={[styles.chartCellText, compact && styles.chartCellTextCompact]} numberOfLines={1}>
        {display}
      </Text>
    );
  }

  return (
    <>
      <Pressable
        style={[styles.chartCellPressable, display && styles.chartCellPressableFilled]}
        onPress={onOpen}
      >
        <Text
          style={[
            styles.chartCellText,
            compact && styles.chartCellTextCompact,
            !display && styles.chartCellTextEmpty,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {display}
        </Text>
      </Pressable>

      <PickerModal visible={isOpen} onClose={onClose} title="Select planet">
        <ScrollView
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          style={styles.pickerModalScroll}
          contentContainerStyle={styles.pickerModalScrollContent}
        >
          <View style={styles.pickerModalPlanetGrid}>
            {HOROSCOPE_PLANETS.map((planet) => {
              const selected = resolveHoroscopeCellValue(value) === planet.value;
              return (
                <Pressable
                  key={planet.value}
                  style={[styles.pickerModalPlanetOption, selected && styles.pickerModalOptionSelected]}
                  onPress={() => {
                    onChange(planet.value);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.pickerModalPlanetOptionText,
                      selected && styles.pickerModalOptionTextSelected,
                    ]}
                  >
                    {planet.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {value ? (
            <Pressable
              style={styles.pickerModalClearButton}
              onPress={() => {
                onChange('');
                onClose();
              }}
            >
              <Text style={styles.pickerModalClearButtonText}>Delete</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </PickerModal>
    </>
  );
}

function HoroscopeChart({
  cells,
  centerLabel,
  editable,
  onCellChange,
  compact,
  dense,
  printNativeID,
}: {
  cells: string[][];
  centerLabel: string;
  editable: boolean;
  onCellChange: (row: number, col: number, value: string) => void;
  compact?: boolean;
  dense?: boolean;
  printNativeID?: string;
}) {
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);

  const renderCell = (row: number, col: number) => {
    const isOpen = activeCell?.row === row && activeCell?.col === col;

    return (
      <View
        key={`${row}-${col}`}
        style={[styles.chartCellWrap, compact && styles.chartCellWrapCompact]}
      >
        <HoroscopeCellPicker
          value={cells[row][col]}
          editable={editable}
          compact={compact}
          isOpen={isOpen}
          onOpen={() => setActiveCell({ row, col })}
          onClose={() => setActiveCell(null)}
          onChange={(nextValue) => onCellChange(row, col, nextValue)}
        />
      </View>
    );
  };

  return (
    <View nativeID={printNativeID} style={[styles.chartBox, dense && styles.chartBoxDense]}>
      <View style={styles.chartDoubleOuter}>
        <View style={styles.chartDoubleInner}>
          <View style={[styles.chartGrid, compact && styles.chartGridCompact, dense && styles.chartGridDense]}>
            <View style={styles.chartGridRow}>
              {renderCell(0, 0)}
              {renderCell(0, 1)}
              {renderCell(0, 2)}
              {renderCell(0, 3)}
            </View>

            <View style={styles.chartGridRowDouble}>
              <View style={styles.chartSideStack}>
                {renderCell(1, 0)}
                {renderCell(2, 0)}
              </View>
              <View style={[styles.chartCenter, compact && styles.chartCenterCompact]}>
                <Text
                  style={[styles.chartCenterLabel, compact && styles.chartCenterLabelCompact]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {centerLabel}
                </Text>
              </View>
              <View style={styles.chartSideStack}>
                {renderCell(1, 3)}
                {renderCell(2, 3)}
              </View>
            </View>

            <View style={styles.chartGridRow}>
              {renderCell(3, 0)}
              {renderCell(3, 1)}
              {renderCell(3, 2)}
              {renderCell(3, 3)}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function reviewDisplayValue(value: string): string {
  return value.trim();
}

const REVIEW_LABEL_WIDTH = 108;
const REVIEW_LABEL_WIDTH_EXPANDED = 132;
const REVIEW_INLINE_LABEL_WIDTH = 46;

function reviewUniqueJoin(parts: string[], separator = ' — '): string {
  const seen = new Set<string>();

  return parts
    .map((part) => part.trim())
    .filter((part) => {
      if (!part) {
        return false;
      }
      const key = part.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .join(separator);
}

function buildReviewOccupationLine(
  occupationTypeLabel: string,
  occupationRoleLabel: string,
  occupationDesignation: string,
): string {
  return reviewUniqueJoin([occupationTypeLabel, occupationRoleLabel, occupationDesignation]);
}

function reviewDisplayOption(
  optionsKey: FormOptionsKey,
  value: string,
  language: Language,
): string {
  if (!value.trim()) {
    return '';
  }
  const resolved = resolveStoredOptionValue(optionsKey, value, language);
  return getOptionLabel(optionsKey, resolved, language, value) || value.trim();
}

function ReviewDataRow({
  label,
  value,
  expanded = false,
}: {
  label: string;
  value: string;
  expanded?: boolean;
}) {
  const labelWidth = expanded ? REVIEW_LABEL_WIDTH_EXPANDED : REVIEW_LABEL_WIDTH;

  return (
    <View style={[reviewStyles.dataRow, expanded && reviewStyles.dataRowExpanded]}>
      <Text
        style={[reviewStyles.dataLabel, { width: labelWidth }]}
        numberOfLines={expanded ? 2 : 2}
      >
        {label}
      </Text>
      <Text style={reviewStyles.dataColon}>:</Text>
      <Text style={reviewStyles.dataValue}>{reviewDisplayValue(value)}</Text>
    </View>
  );
}

function ReviewInlinePair({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
}) {
  const renderHalf = (label: string, value: string, labelWidth: number) => (
    <View style={reviewStyles.inlineHalf}>
      <Text style={[reviewStyles.inlineHalfLabel, { width: labelWidth }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={reviewStyles.dataColon}>:</Text>
      <Text style={reviewStyles.inlineHalfValue} numberOfLines={2}>
        {reviewDisplayValue(value)}
      </Text>
    </View>
  );

  return (
    <View style={reviewStyles.dataRow}>
      {renderHalf(leftLabel, leftValue, REVIEW_INLINE_LABEL_WIDTH)}
      <View style={reviewStyles.inlineHalfDivider} />
      {renderHalf(rightLabel, rightValue, REVIEW_INLINE_LABEL_WIDTH + 8)}
    </View>
  );
}

function ReviewSidebarBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={reviewStyles.sidebarBox}>
      <Text style={reviewStyles.sidebarBoxLabel} numberOfLines={2}>
        {label}
      </Text>
      <Text style={reviewStyles.sidebarBoxValue} numberOfLines={2}>
        {reviewDisplayValue(value)}
      </Text>
    </View>
  );
}

function ReviewSiblingBox({
  title,
  rows,
  wide = false,
}: {
  title: string;
  rows: Array<{ label: string; value: string }>;
  wide?: boolean;
}) {
  return (
    <View style={[reviewStyles.siblingBox, wide && reviewStyles.siblingBoxWide]}>
      <Text style={[reviewStyles.siblingBoxTitle, wide && reviewStyles.siblingBoxTitleWide]}>{title}</Text>
      {rows.map((row) => (
        <View key={row.label} style={[reviewStyles.siblingRow, wide && reviewStyles.siblingRowWide]}>
          <Text
            style={[reviewStyles.siblingLabel, wide && reviewStyles.siblingLabelWide]}
            numberOfLines={2}
          >
            {row.label}
          </Text>
          <Text style={reviewStyles.siblingColon}>:</Text>
          <Text
            style={[reviewStyles.siblingValue, wide && reviewStyles.siblingValueWide]}
            numberOfLines={1}
          >
            {reviewDisplayValue(row.value)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function formatLetterheadPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 10) {
    return value;
  }
  return `${digits.slice(0, 2)}\u00A0${digits.slice(2, 4)}\u00A0${digits.slice(4, 6)}\u00A0${digits.slice(6, 8)}\u00A0${digits.slice(8)}`;
}

function BiodataLetterheadHeader({
  registrationNumber,
  translate,
}: {
  registrationNumber: string;
  translate: (key: string) => string;
}) {
  const logoUri = Platform.OS === 'web' ? getLogoUri() : undefined;

  return (
    <View style={reviewStyles.letterhead}>
      <View nativeID="biodata-print-logo" style={reviewStyles.letterheadLogoWrap}>
        {Platform.OS === 'web' && logoUri ? (
          createElement('img', {
            src: logoUri,
            alt: 'Ayya Matrimony',
            style: {
              width: 40,
              height: 40,
              objectFit: 'contain',
              display: 'block',
            },
          })
        ) : (
          <Image source={images.logo} style={reviewStyles.letterheadLogo} resizeMode="contain" />
        )}
      </View>

      <View style={reviewStyles.letterheadCenter}>
        <Text style={reviewStyles.letterheadInvocation}>
          {translate('biodataBrandAyya')} {translate('biodataBrandThunai')}
        </Text>
        <Text
          style={reviewStyles.letterheadTitle}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
        >
          {translate('biodataOrgTitle')}
        </Text>
        <Text style={reviewStyles.letterheadAddress} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
          {translate('biodataOrgAddressLine1')}
        </Text>
        <Text style={reviewStyles.letterheadAddress} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
          {translate('biodataOrgAddressLine2')}
        </Text>
        <View style={reviewStyles.letterheadPhones}>
          <View style={reviewStyles.phoneRow}>
            <MaterialCommunityIcons name="whatsapp" size={11} color="#25D366" />
            <Text
              style={reviewStyles.phoneText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {formatLetterheadPhone(translate('biodataOrgPhone1'))}
            </Text>
          </View>
          <View style={reviewStyles.phoneRow}>
            <MaterialCommunityIcons name="whatsapp" size={11} color="#25D366" />
            <Text
              style={reviewStyles.phoneText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {formatLetterheadPhone(translate('biodataOrgPhone2'))}
            </Text>
          </View>
        </View>
      </View>

      <View style={reviewStyles.registrationDivider} />
      <View style={reviewStyles.registrationBox}>
        <Text style={reviewStyles.registrationLabel} numberOfLines={2}>
          {translate('biodataRegistrationNumberLabel')}
        </Text>
        <Text style={reviewStyles.registrationValue}>{registrationNumber.trim()}</Text>
      </View>
    </View>
  );
}

function ChristianBiodataReviewSheet({
  form,
  language,
  translate,
  registrationCommunity,
}: {
  form: BiodataState;
  language: Language;
  translate: (key: string) => string;
  registrationCommunity: RegistrationCommunityId;
}) {
  const { getValue } = useProfileForm();
  const nativePlace = getValue('nativePlace').trim();
  const expectations = getValue('expectations').trim() || getValue('partnerExpectations').trim();

  const degreeLabel = reviewDisplayOption('degreeDetail', form.education, language);
  const occupationTypeLabel = reviewDisplayOption('occupationType', form.occupationType, language);
  const occupationRoleLabel = reviewDisplayOption('occupation', form.occupation, language);
  const occupationLine = buildReviewOccupationLine(
    occupationTypeLabel,
    occupationRoleLabel,
    form.occupationDesignation,
  );
  const propertyLine = getPropertyDisplayValue(
    form.propertyDetails,
    language,
    translate,
    form.propertyHouseType,
    form.propertyHouseCount,
  );

  const marriedRows = [
    { label: translate('biodataRelationElderBrother'), value: reviewDisplayOption('siblingCount', form.marriedBrother, language) },
    { label: translate('biodataRelationYoungerBrother'), value: reviewDisplayOption('siblingCount', form.marriedYoungerBrother, language) },
    { label: translate('biodataRelationElderSister'), value: reviewDisplayOption('siblingCount', form.marriedSister, language) },
    { label: translate('biodataRelationYoungerSister'), value: reviewDisplayOption('siblingCount', form.marriedYoungerSister, language) },
  ];

  const unmarriedRows = [
    { label: translate('biodataRelationElderBrother'), value: reviewDisplayOption('siblingCount', form.unmarriedBrother, language) },
    { label: translate('biodataRelationYoungerBrother'), value: reviewDisplayOption('siblingCount', form.unmarriedYoungerBrother, language) },
    { label: translate('biodataRelationElderSister'), value: reviewDisplayOption('siblingCount', form.unmarriedSister, language) },
    { label: translate('biodataRelationYoungerSister'), value: reviewDisplayOption('siblingCount', form.unmarriedYoungerSister, language) },
  ];

  return (
    <View
      nativeID="biodata-print-root"
      style={[reviewStyles.sheet, christianReviewStyles.sheetFullScreen]}
    >
      <BiodataLetterheadHeader registrationNumber={form.registrationNumber} translate={translate} />
      <ScrollView
        nativeID="biodata-print-christian-body"
        style={christianReviewStyles.bodyScroll}
        contentContainerStyle={christianReviewStyles.bodyScrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View
          nativeID="biodata-print-christian-body-row"
          style={[reviewStyles.bodyRow, christianReviewStyles.bodyRowFullScreen]}
        >
        <View
          nativeID="biodata-print-christian-left-pane"
          style={[reviewStyles.leftPane, christianReviewStyles.leftPaneFullScreen]}
        >
          <ReviewDataRow expanded label={translate('biodataReviewName')} value={form.fullName} />
          <ReviewDataRow
            expanded
            label={translate('gender')}
            value={reviewDisplayOption('gender', form.gender, language)}
          />
          <ReviewDataRow expanded label={translate('biodataReviewDob')} value={form.dateOfBirth} />
          <ReviewDataRow expanded label={translate('biodataReviewEducation')} value={degreeLabel} />
          <ReviewDataRow expanded label={translate('biodataReviewOccupation')} value={occupationLine} />
          <ReviewDataRow
            expanded
            label={translate('biodataReviewIncome')}
            value={reviewDisplayOption('monthlyIncome', form.monthlyIncome, language)}
          />
          <ReviewDataRow expanded label={translate('biodataReviewProperty')} value={propertyLine} />
          <ReviewDataRow expanded label={translate('biodataReviewNativePlace')} value={nativePlace} />
          <ReviewDataRow expanded label={translate('biodataReviewResidence')} value={form.irupidam} />
          <ReviewDataRow expanded label={translate('biodataReviewFather')} value={form.fatherName} />
          <ReviewDataRow expanded label={translate('biodataReviewMother')} value={form.motherName} />
          <ReviewDataRow
            expanded
            label={translate('biodataReviewSeervarisai')}
            value={reviewDisplayOption('seervarisai', form.seervarisai, language)}
          />
          <ReviewDataRow
            expanded
            label={translate('biodataReviewHeight')}
            value={reviewDisplayOption('height', form.height, language)}
          />
          <ReviewDataRow
            expanded
            label={translate('biodataReviewComplexion')}
            value={reviewDisplayOption('complexionBiodata', form.complexion, language)}
          />
          <ReviewDataRow expanded label={translate('biodataReviewExpectation')} value={expectations} />
        </View>

        <View
          nativeID="biodata-print-christian-right-pane"
          style={[
            reviewStyles.rightPane,
            christianReviewStyles.rightPane,
            christianReviewStyles.rightPaneFullScreen,
          ]}
        >
          <View style={[christianReviewStyles.locationBox, christianReviewStyles.locationBoxCompact]}>
            <Text style={reviewStyles.sidebarBoxLabel}>{translate('biodataReviewNativePlace')}</Text>
            <Text style={christianReviewStyles.locationValue}>{reviewDisplayValue(nativePlace)}</Text>
          </View>
          <View style={[christianReviewStyles.locationBox, christianReviewStyles.locationBoxCompact]}>
            <Text style={reviewStyles.sidebarBoxLabel}>{translate('biodataReviewResidence')}</Text>
            <Text style={christianReviewStyles.locationValue}>{reviewDisplayValue(form.irupidam)}</Text>
          </View>
          <View style={christianReviewStyles.siblingSectionExpanded}>
            <ReviewSiblingBox wide title={translate('biodataReviewMarried')} rows={marriedRows} />
          </View>
          <View style={christianReviewStyles.siblingSectionExpanded}>
            <ReviewSiblingBox wide title={translate('biodataReviewUnmarried')} rows={unmarriedRows} />
          </View>
        </View>
        </View>
      </ScrollView>

      <View nativeID="biodata-print-christian-footer" style={christianReviewStyles.footer}>
        <Text style={christianReviewStyles.feeText}>{translate('biodataChristianRegistrationFee')}</Text>
      </View>
    </View>
  );
}

function BiodataReviewSheet({
  form,
  language,
  translate,
  rasiChart,
  amsamChart,
  detailGrid,
  onFieldChange,
  onRasiChartChange,
  onAmsamChartChange,
  onDetailGridChange,
  editable,
  dense,
  registrationCommunity = 'hindu',
  religion = '',
}: {
  form: BiodataState;
  language: Language;
  translate: (key: string) => string;
  rasiChart: string[][];
  amsamChart: string[][];
  detailGrid: string[];
  onFieldChange: (field: keyof BiodataState, value: string) => void;
  onRasiChartChange: (updater: (current: string[][]) => string[][]) => void;
  onAmsamChartChange: (updater: (current: string[][]) => string[][]) => void;
  onDetailGridChange: (updater: (current: string[]) => string[]) => void;
  editable: boolean;
  dense?: boolean;
  registrationCommunity?: string;
  religion?: string;
}) {
  if (isChristianRegistration(registrationCommunity, religion)) {
    return (
      <ChristianBiodataReviewSheet
        form={form}
        language={language}
        translate={translate}
        registrationCommunity={registrationCommunity as RegistrationCommunityId}
      />
    );
  }

  const degreeLabel = reviewDisplayOption('degreeDetail', form.education, language);
  const nameLine = [form.fullName.trim(), degreeLabel.trim()].filter(Boolean).join(' ');
  const occupationTypeLabel = reviewDisplayOption('occupationType', form.occupationType, language);
  const occupationRoleLabel = reviewDisplayOption('occupation', form.occupation, language);
  const occupationLine = buildReviewOccupationLine(
    occupationTypeLabel,
    occupationRoleLabel,
    form.occupationDesignation,
  );
  const propertyLine = getPropertyDisplayValue(
    form.propertyDetails,
    language,
    translate,
    form.propertyHouseType,
    form.propertyHouseCount,
  );

  const marriedRows = [
    { label: translate('biodataRelationElderBrother'), value: reviewDisplayOption('siblingCount', form.marriedBrother, language) },
    { label: translate('biodataRelationYoungerBrother'), value: reviewDisplayOption('siblingCount', form.marriedYoungerBrother, language) },
    { label: translate('biodataRelationElderSister'), value: reviewDisplayOption('siblingCount', form.marriedSister, language) },
    { label: translate('biodataRelationYoungerSister'), value: reviewDisplayOption('siblingCount', form.marriedYoungerSister, language) },
  ];

  const unmarriedRows = [
    { label: translate('biodataRelationElderBrother'), value: reviewDisplayOption('siblingCount', form.unmarriedBrother, language) },
    { label: translate('biodataRelationYoungerBrother'), value: reviewDisplayOption('siblingCount', form.unmarriedYoungerBrother, language) },
    { label: translate('biodataRelationElderSister'), value: reviewDisplayOption('siblingCount', form.unmarriedSister, language) },
    { label: translate('biodataRelationYoungerSister'), value: reviewDisplayOption('siblingCount', form.unmarriedYoungerSister, language) },
  ];

  return (
    <View nativeID="biodata-print-root" style={reviewStyles.sheet}>
      <BiodataLetterheadHeader registrationNumber={form.registrationNumber} translate={translate} />
      <View style={reviewStyles.bodyRow}>
        <View style={reviewStyles.leftPane}>
          <ReviewDataRow label={translate('biodataReviewName')} value={nameLine} />
          <ReviewDataRow
            label={translate('gender')}
            value={reviewDisplayOption('gender', form.gender, language)}
          />
          <ReviewDataRow label={translate('biodataReviewDob')} value={form.dateOfBirth} />
          <ReviewDataRow label={translate('biodataReviewBirthTiming')} value={form.birthTiming} />
          <ReviewDataRow
            label={translate('biodataReviewStar')}
            value={reviewDisplayOption('nakshatra', form.natchathiram, language)}
          />
          <ReviewInlinePair
            leftLabel={translate('biodataReviewRasi')}
            leftValue={reviewDisplayOption('rasi', form.rasi, language)}
            rightLabel={translate('biodataReviewLagnam')}
            rightValue={reviewDisplayOption('rasi', form.lagnam, language)}
          />
          <ReviewDataRow label={translate('biodataReviewOccupation')} value={occupationLine} />
          <ReviewDataRow
            label={translate('biodataReviewIncome')}
            value={reviewDisplayOption('monthlyIncome', form.monthlyIncome, language)}
          />
          <ReviewDataRow label={translate('biodataReviewProperty')} value={propertyLine} />
          <ReviewDataRow label={translate('biodataReviewFather')} value={form.fatherName} />
          <ReviewDataRow label={translate('biodataReviewMother')} value={form.motherName} />
          <ReviewDataRow label={translate('biodataReviewResidence')} value={form.irupidam} />
        </View>

        <View style={reviewStyles.rightPane}>
          <ReviewSidebarBox
            label={translate('biodataReviewTotalMembers')}
            value={reviewDisplayOption('siblingCount', form.totalFamilyMembers, language)}
          />
          <ReviewSidebarBox
            label={translate('biodataReviewBirthOrder')}
            value={reviewDisplayOption('birthOrder', form.birthOrder, language)}
          />
          <ReviewSiblingBox wide title={translate('biodataReviewUnmarried')} rows={unmarriedRows} />
          <ReviewSiblingBox wide title={translate('biodataReviewMarried')} rows={marriedRows} />
          <ReviewSidebarBox
            label={translate('biodataReviewComplexion')}
            value={reviewDisplayOption('complexionBiodata', form.complexion, language)}
          />
          <View style={reviewStyles.sidebarPairRow}>
            <View style={reviewStyles.sidebarPairItem}>
              <ReviewSidebarBox
                label={translate('biodataReviewHeight')}
                value={reviewDisplayOption('height', form.height, language)}
              />
            </View>
            <View style={reviewStyles.sidebarPairItem}>
              <ReviewSidebarBox
                label={translate('biodataReviewSeervarisai')}
                value={reviewDisplayOption('seervarisai', form.seervarisai, language)}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.horoscopeSection, dense && styles.horoscopeSectionDense, reviewStyles.horoscopeSection]}>
        <View nativeID="biodata-print-charts" style={[styles.chartsRow, dense && styles.chartsRowDense]}>
          <HoroscopeChart
            centerLabel={translate('biodataChartRasi')}
            cells={rasiChart}
            editable={editable}
            compact={dense}
            dense
            printNativeID="biodata-print-chart-rasi"
            onCellChange={(row, col, value) => {
              onRasiChartChange((current) =>
                current.map((cells, rowIndex) =>
                  cells.map((cell, colIndex) => (rowIndex === row && colIndex === col ? value : cell)),
                ),
              );
            }}
          />
          <HoroscopeChart
            centerLabel={translate('biodataChartAmsam')}
            cells={amsamChart}
            editable={editable}
            compact={dense}
            dense
            printNativeID="biodata-print-chart-amsam"
            onCellChange={(row, col, value) => {
              onAmsamChartChange((current) =>
                current.map((cells, rowIndex) =>
                  cells.map((cell, colIndex) => (rowIndex === row && colIndex === col ? value : cell)),
                ),
              );
            }}
          />
        </View>

        <View
          nativeID="biodata-print-horoscope-footer"
          style={[styles.horoscopeFooterCard, dense && styles.horoscopeFooterCardDense]}
        >
          <DasaBalanceFields
            dasaBalance={form.dasaBalance}
            dasaYear={form.dasaYear}
            dasaMonth={form.dasaMonth}
            dasaDay={form.dasaDay}
            onFieldChange={onFieldChange}
            editable={editable}
            dense={dense}
          />

          <DetailGrid
            cells={detailGrid}
            editable={editable}
            dense={dense}
            onCellChange={(index, value) => {
              onDetailGridChange((current) =>
                current.map((cell, cellIndex) => (cellIndex === index ? value : cell)),
              );
            }}
          />
        </View>
      </View>
    </View>
  );
}

const reviewStyles = StyleSheet.create({
  sheet: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    overflow: 'visible',
  },
  letterhead: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 72,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  letterheadLogoWrap: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 2,
  },
  letterheadLogo: {
    width: 40,
    height: 40,
  },
  letterheadCenter: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 2,
  },
  letterheadInvocation: {
    color: colors.primary,
    fontFamily: fonts.interSemi,
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
  },
  letterheadTitle: {
    color: colors.primary,
    fontFamily: fonts.playfair,
    fontSize: 13,
    lineHeight: 16,
    textAlign: 'center',
    width: '100%',
  },
  letterheadAddress: {
    color: colors.primary,
    fontFamily: fonts.inter,
    fontSize: 8.5,
    lineHeight: 11,
    textAlign: 'center',
    width: '100%',
  },
  letterheadPhones: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginTop: 2,
    width: '100%',
    paddingHorizontal: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 0,
  },
  phoneText: {
    flexShrink: 1,
    color: colors.primary,
    fontFamily: fonts.interMedium,
    fontSize: 8.5,
    lineHeight: 11,
  },
  registrationDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    marginVertical: 2,
    flexShrink: 0,
  },
  registrationBox: {
    width: 60,
    minWidth: 60,
    flexShrink: 0,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  registrationLabel: {
    color: colors.primary,
    fontFamily: fonts.interSemi,
    fontSize: 7.5,
    lineHeight: 10,
    textAlign: 'center',
  },
  registrationValue: {
    color: colors.primary,
    fontFamily: fonts.interSemi,
    fontSize: 13,
    lineHeight: 16,
    textAlign: 'center',
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
  },
  leftPane: {
    flex: 1.55,
    minWidth: 0,
  },
  rightPane: {
    flex: 1,
    minWidth: 150,
    maxWidth: '42%',
    padding: 6,
    gap: 4,
    backgroundColor: '#ffffff',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(87, 0, 0, 0.12)',
    minHeight: 30,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  dataRowExpanded: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
  },
  dataLabel: {
    color: colors.primary,
    fontFamily: fonts.interSemi,
    fontSize: 12,
    lineHeight: 16,
    flexShrink: 0,
    textAlign: 'right',
    paddingRight: 2,
  },
  dataLabelExpanded: {
    flexShrink: 0,
  },
  dataColon: {
    color: colors.primary,
    fontFamily: fonts.interSemi,
    fontSize: 12,
    lineHeight: 16,
    width: 10,
    flexShrink: 0,
    textAlign: 'center',
  },
  dataValue: {
    flex: 1,
    minWidth: 0,
    color: colors.onSurface,
    fontFamily: fonts.interMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  inlineHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    paddingHorizontal: 2,
  },
  inlineHalfDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(87, 0, 0, 0.12)',
    marginVertical: 4,
    flexShrink: 0,
  },
  inlineHalfLabel: {
    color: colors.primary,
    fontFamily: fonts.interSemi,
    fontSize: 12,
    lineHeight: 16,
    flexShrink: 0,
    textAlign: 'right',
    paddingRight: 2,
  },
  inlineHalfValue: {
    flex: 1,
    minWidth: 0,
    color: colors.onSurface,
    fontFamily: fonts.interMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  sidebarBox: {
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.12)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: '#FFFFFF',
    minHeight: 34,
    justifyContent: 'center',
    flexShrink: 0,
  },
  sidebarBoxLabel: {
    color: colors.primary,
    fontFamily: fonts.interSemi,
    fontSize: 10,
    lineHeight: 13,
  },
  sidebarBoxValue: {
    color: colors.onSurface,
    fontFamily: fonts.interMedium,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 1,
  },
  sidebarPairRow: {
    flexDirection: 'row',
    gap: 4,
    width: '100%',
  },
  sidebarPairItem: {
    flex: 1,
    minWidth: 0,
  },
  siblingBox: {
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.12)',
    borderRadius: 6,
    padding: 5,
    backgroundColor: '#FFFFFF',
    gap: 2,
  },
  siblingBoxWide: {
    paddingVertical: 9,
    paddingHorizontal: 8,
    gap: 4,
    flex: 1,
    minHeight: 88,
    justifyContent: 'center',
  },
  siblingBoxTitle: {
    color: colors.primary,
    fontFamily: fonts.interSemi,
    fontSize: 10,
    lineHeight: 13,
    marginBottom: 2,
  },
  siblingBoxTitleWide: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 4,
  },
  siblingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 18,
    gap: 2,
  },
  siblingRowWide: {
    alignItems: 'center',
    minHeight: 22,
    gap: 2,
  },
  siblingLabel: {
    color: colors.primary,
    fontFamily: fonts.inter,
    fontSize: 9,
    lineHeight: 12,
    width: 78,
    flexShrink: 0,
  },
  siblingLabelWide: {
    width: 88,
    flexShrink: 0,
    fontSize: 10,
    lineHeight: 14,
    fontFamily: fonts.interMedium,
  },
  siblingColon: {
    color: colors.primary,
    fontSize: 9,
    lineHeight: 12,
    width: 8,
    flexShrink: 0,
    textAlign: 'center',
  },
  siblingValue: {
    flex: 1,
    minWidth: 0,
    color: colors.onSurface,
    fontFamily: fonts.interMedium,
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'right',
  },
  siblingValueWide: {
    flex: 1,
    minWidth: 20,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'right',
  },
  horoscopeSection: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
});

const christianReviewStyles = StyleSheet.create({
  sheetFullScreen: {
    flex: 1,
    borderRadius: 14,
    minHeight: 0,
    ...Platform.select({
      web: { minHeight: '100%' },
      default: {},
    }),
  },
  bodyScroll: {
    flex: 1,
    minHeight: 0,
  },
  bodyScrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  bodyRowFullScreen: {
    flexGrow: 1,
    alignItems: 'stretch',
    ...Platform.select({
      web: { minHeight: '100%' },
      default: { minHeight: 520 },
    }),
  },
  leftPaneFullScreen: {
    flex: 1.35,
    minWidth: 0,
    flexDirection: 'column',
  },
  rightPane: {
    gap: 6,
    paddingVertical: 8,
  },
  rightPaneFullScreen: {
    flex: 1,
    minWidth: 168,
    minHeight: 0,
    maxWidth: '100%',
    paddingHorizontal: 8,
    flexDirection: 'column',
  },
  locationBox: {
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.12)',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 56,
    gap: 4,
  },
  locationBoxCompact: {
    flex: 1,
    flexShrink: 1,
    minHeight: 52,
    paddingVertical: 7,
    paddingHorizontal: 8,
    gap: 3,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  locationBoxExpanded: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'center',
  },
  locationValue: {
    color: colors.onSurface,
    fontFamily: fonts.interMedium,
    fontSize: 12,
    lineHeight: 17,
  },
  siblingSectionExpanded: {
    flex: 1.65,
    minHeight: 100,
    justifyContent: 'center',
    width: '100%',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.primary,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 14,
    flexShrink: 0,
    backgroundColor: '#FFFBF8',
  },
  feeText: {
    color: colors.primary,
    fontFamily: fonts.interSemi,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
});

type CreateProfileBiodataFormProps = {
  editable: boolean;
  onSave: () => void;
  onStepChange?: (step: number) => void;
  viewOnly?: boolean;
  profileValues?: Record<string, string>;
  hideActionBar?: boolean;
};

export function CreateProfileBiodataForm({
  editable,
  onSave,
  onStepChange,
  viewOnly = false,
  profileValues,
  hideActionBar = false,
}: CreateProfileBiodataFormProps) {
  const { width: screenWidth } = useWindowDimensions();
  const sideBySide = Platform.OS === 'web' ? screenWidth >= 320 : screenWidth >= 560;
  const dense = true;
  const stacked = !sideBySide;
  const { translate, language } = useLanguage();
  const { getValue, setValue, isReady } = useProfileForm();
  const [rasiChart, setRasiChart] = useState(emptyHoroscope);
  const [amsamChart, setAmsamChart] = useState(emptyHoroscope);
  const [detailGrid, setDetailGrid] = useState<string[]>(createDefaultDetailGrid);
  const [stepState, setStep] = useState<1 | 2 | 3>(1);
  const step = viewOnly ? 3 : stepState;
  const [form, setForm] = useState<BiodataState>({
    fullName: '',
    gender: '',
    education: '',
    dateOfBirth: '',
    birthTiming: '',
    natchathiram: '',
    rasi: '',
    lagnam: '',
    occupation: '',
    occupationType: '',
    occupationDesignation: '',
    monthlyIncome: '',
    propertyDetails: '',
    propertyHouseType: '',
    propertyHouseCount: '',
    fatherName: '',
    motherName: '',
    irupidam: '',
    totalFamilyMembers: '',
    birthOrder: '',
    marriedBrother: '',
    marriedYoungerBrother: '',
    marriedSister: '',
    marriedYoungerSister: '',
    unmarriedBrother: '',
    unmarriedYoungerBrother: '',
    unmarriedSister: '',
    unmarriedYoungerSister: '',
    complexion: '',
    height: '',
    seervarisai: '',
    dasaBalance: '',
    dasaYear: '',
    dasaMonth: '',
    dasaDay: '',
    registrationNumber: '',
    numSiblings: '',
    maritalStatus: 'unmarried',
    livingStatus: 'with-family',
    eatingHabits: 'veg',
    birthOrderRelation: '',
  });

  useEffect(() => {
    if (!profileValues && !isReady) {
      return;
    }

    const readValue = (key: string) => profileValues?.[key] ?? getValue(key);

    setRasiChart(parseHoroscope(readValue('biodataHoroscopeRasi')));
    setAmsamChart(parseHoroscope(readValue('biodataHoroscopeAmsam')));
    setDetailGrid(parseDetailGrid(readValue('biodataDetailGrid')));

    const storedRegistration = readValue('registrationNumber').trim();
    const normalizedRegistration = normalizeRegistrationNumber(storedRegistration);
    const registrationNumber = normalizedRegistration || generateRegistrationNumber();
    if (!profileValues && (!normalizedRegistration || normalizedRegistration !== storedRegistration)) {
      setValue('registrationNumber', registrationNumber);
    }

    setForm({
      fullName: readValue('fullName'),
      gender: readValue('gender'),
      education: readValue('education'),
      dateOfBirth: readValue('dateOfBirth'),
      birthTiming: readValue('birthTiming'),
      natchathiram: readValue('natchathiram'),
      rasi: readValue('rasi'),
      lagnam: readValue('lagnam'),
      occupation: readValue('occupation'),
      occupationType: readValue('occupationType'),
      occupationDesignation: readValue('occupationDesignation'),
      monthlyIncome: readValue('monthlyIncome'),
      propertyDetails: readValue('propertyDetails'),
      propertyHouseType: (readValue('propertyHouseType') as string) || '',
      propertyHouseCount: readValue('propertyHouseCount'),
      fatherName: readValue('fatherName'),
      motherName: readValue('motherName'),
      irupidam: readValue('irupidam') || readValue('nativePlace'),
      totalFamilyMembers: readValue('totalFamilyMembers'),
      birthOrder: readValue('birthOrder'),
      marriedBrother: readValue('marriedBrother'),
      marriedYoungerBrother: readValue('marriedYoungerBrother'),
      marriedSister: readValue('marriedSister'),
      marriedYoungerSister: readValue('marriedYoungerSister'),
      unmarriedBrother: readValue('unmarriedBrother'),
      unmarriedYoungerBrother: readValue('unmarriedYoungerBrother'),
      unmarriedSister: readValue('unmarriedSister'),
      unmarriedYoungerSister: readValue('unmarriedYoungerSister'),
      complexion: readValue('complexion'),
      height: readValue('height'),
      seervarisai: readValue('seervarisai'),
      dasaBalance: readValue('dasaBalance'),
      dasaYear: readValue('dasaYear'),
      dasaMonth: readValue('dasaMonth'),
      dasaDay: readValue('dasaDay'),
      registrationNumber: profileValues ? storedRegistration || registrationNumber : registrationNumber,
      numSiblings: readValue('numSiblings'),
      maritalStatus: readValue('maritalStatus') || 'unmarried',
      livingStatus: readValue('livingStatus') || 'with-family',
      eatingHabits: readValue('eatingHabits') || 'veg',
      birthOrderRelation: readValue('birthOrderRelation') || readValue('birthOrder'),
    });
  }, [getValue, isReady, profileValues, setValue]);

  const updateField = useCallback((key: keyof BiodataState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const persistForm = useCallback(() => {
    setValue('fullName', form.fullName.trim());
    setValue('gender', form.gender.trim());
    setValue('education', form.education.trim());
    setValue('dateOfBirth', form.dateOfBirth.trim());
    setValue('birthTiming', form.birthTiming.trim());
    setValue('natchathiram', form.natchathiram.trim());
    setValue('rasi', form.rasi.trim());
    setValue('lagnam', form.lagnam.trim());
    const occupationWorkKey = resolveStoredOptionValue('occupation', form.occupation, language);

    setValue('occupationType', form.occupationType.trim());
    setValue('occupation', occupationWorkKey);
    setValue('occupationDesignation', form.occupationDesignation.trim());
    if (form.occupationType.trim()) {
      setValue('workType', form.occupationType.trim());
    }
    setValue('monthlyIncome', form.monthlyIncome.trim());
    setValue('propertyDetails', form.propertyDetails.trim());
    setValue('propertyHouseType', form.propertyHouseType.trim());
    setValue('propertyHouseCount', form.propertyHouseCount.trim());
    setValue('fatherName', form.fatherName.trim());
    setValue('motherName', form.motherName.trim());
    setValue('irupidam', form.irupidam.trim());
    setValue('nativePlace', form.irupidam.trim());
    setValue('totalFamilyMembers', form.totalFamilyMembers.trim());
    setValue('birthOrder', form.birthOrder.trim());
    setValue('marriedBrother', form.marriedBrother.trim());
    setValue('marriedYoungerBrother', form.marriedYoungerBrother.trim());
    setValue('marriedSister', form.marriedSister.trim());
    setValue('marriedYoungerSister', form.marriedYoungerSister.trim());
    setValue('unmarriedBrother', form.unmarriedBrother.trim());
    setValue('unmarriedYoungerBrother', form.unmarriedYoungerBrother.trim());
    setValue('unmarriedSister', form.unmarriedSister.trim());
    setValue('unmarriedYoungerSister', form.unmarriedYoungerSister.trim());
    setValue('complexion', form.complexion.trim());
    setValue('height', form.height.trim());
    setValue('seervarisai', form.seervarisai.trim());
    setValue('dasaBalance', form.dasaBalance.trim());
    setValue('dasaYear', form.dasaYear.trim());
    setValue('dasaMonth', form.dasaMonth.trim());
    setValue('dasaDay', form.dasaDay.trim());
    setValue('registrationNumber', getValue('registrationNumber').trim() || form.registrationNumber.trim());
    setValue('numSiblings', form.numSiblings.trim());
    setValue('maritalStatus', form.maritalStatus.trim());
    setValue('livingStatus', form.livingStatus.trim());
    setValue('eatingHabits', form.eatingHabits.trim());
    setValue('birthOrder', form.birthOrder.trim());
    setValue('birthOrderRelation', form.birthOrder.trim());
    setValue('biodataHoroscopeRasi', JSON.stringify(rasiChart));
    setValue('biodataHoroscopeAmsam', JSON.stringify(amsamChart));
    setValue('biodataDetailGrid', JSON.stringify(detailGrid));
  }, [detailGrid, form, language, rasiChart, amsamChart, setValue, getValue]);

  const validateOccupationFields = useCallback(() => {
    const hasOccupation = form.occupationType.trim().length > 0;
    const hasRole = form.occupation.trim().length > 0;
    const hasPosition = form.occupationDesignation.trim().length > 0;
    const hasAny = hasOccupation || hasRole || hasPosition;

    if (!hasAny) {
      return true;
    }

    if (!hasOccupation || !hasRole || !hasPosition) {
      Alert.alert(translate('biodataFieldOccupation'), translate('occupationValidationRequired'));
      return false;
    }

    return true;
  }, [
    form.occupation,
    form.occupationDesignation,
    form.occupationType,
    translate,
  ]);

  const handleSavePress = useCallback(() => {
    if (form.gender !== 'male' && form.gender !== 'female') {
      Alert.alert(translate('gender'), translate('selectGender'));
      return;
    }

    if (!validateOccupationFields()) {
      return;
    }

    persistForm();
    onSave();
  }, [form.gender, onSave, persistForm, translate, validateOccupationFields]);

  const handlePrintPress = useCallback(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
      printBiodataSheetWeb();
      return;
    }

    Alert.alert(translate('print'), translate('downloadPdfAlertBody'));
  }, [translate]);

  useEffect(() => {
    onStepChange?.(step);
  }, [onStepChange, step]);

  const goToNextStep = useCallback(() => {
    if (step === 1 && !validateOccupationFields()) {
      return;
    }
    setStep((current) => (current < 3 ? ((current + 1) as 1 | 2 | 3) : current));
  }, [step, validateOccupationFields]);

  const goToPreviousStep = useCallback(() => {
    setStep((current) => (current > 1 ? ((current - 1) as 1 | 2 | 3) : current));
  }, []);

  const isReviewStep = step === 3;
  const registrationCommunity = profileValues?.registrationCommunity ?? getValue('registrationCommunity');
  const religion = profileValues?.religion ?? getValue('religion');
  const isChristianReview = isReviewStep && isChristianRegistration(registrationCommunity, religion);
  const showHoroscopeIdentityFields = !isChristianRegistration(registrationCommunity, religion);
  const reviewEditable = viewOnly ? false : editable;

  const leftColumn = (
    <>
            <SectionCard dense={dense}>
              <BiodataNameDegreeRow
                label={translate('biodataFieldName')}
                nameValue={form.fullName}
                degreeValue={form.education}
                onNameChange={(text) => updateField('fullName', text)}
                onDegreeChange={(text) => updateField('education', text)}
                editable={editable}
                dense={dense}
                namePlaceholder={translate('biodataPlaceholderName')}
                degreePlaceholder={translate('selectDegree')}
              />
              <BiodataSelectRow
                label={translate('gender')}
                value={form.gender}
                onValueChange={(text) => updateField('gender', text)}
                optionsKey="gender"
                editable={editable}
                dense={dense}
                placeholder={translate('selectGender')}
              />
              <View style={styles.fieldPairRow}>
                <View style={styles.fieldPairItem}>
                  <BiodataDateRow
                    label={translate('biodataFieldDateOfBirth')}
                    value={form.dateOfBirth}
                    onValueChange={(text) => updateField('dateOfBirth', text)}
                    editable={editable}
                    dense={dense}
                    icon="calendar-today"
                    placeholder={translate('biodataDatePlaceholder')}
                    required
                  />
                </View>
                <View style={styles.fieldPairItem}>
                  <BiodataTimeRow
                    label={translate('biodataFieldBirthTiming')}
                    value={form.birthTiming}
                    onValueChange={(text) => updateField('birthTiming', text)}
                    editable={editable}
                    dense={dense}
                    placeholder={translate('biodataTimePlaceholder')}
                  />
                </View>
              </View>
              {showHoroscopeIdentityFields ? (
              <View style={styles.fieldPairRow}>
                <View style={styles.fieldPairItem}>
                  <BiodataSelectRow
                    label={translate('biodataFieldNatchathiramShort')}
                    value={form.natchathiram}
                    onValueChange={(text) => updateField('natchathiram', text)}
                    optionsKey="nakshatra"
                    editable={editable}
                    dense={dense}
                    placeholder={translate('selectNatchathiram')}
                    narrow
                  />
                </View>
                <View style={styles.fieldPairItem}>
                  <BiodataSelectRow
                    label={translate('biodataFieldRasi')}
                    value={form.rasi}
                    onValueChange={(text) => updateField('rasi', text)}
                    optionsKey="rasi"
                    editable={editable}
                    dense={dense}
                    placeholder={translate('selectRasi')}
                    narrow
                  />
                </View>
                <View style={styles.fieldPairItem}>
                  <BiodataSelectRow
                    label={translate('biodataFieldLaknam')}
                    value={form.lagnam}
                    onValueChange={(text) => updateField('lagnam', text)}
                    optionsKey="rasi"
                    editable={editable}
                    dense={dense}
                    placeholder={translate('selectLaknam')}
                    narrow
                  />
                </View>
              </View>
              ) : null}
            </SectionCard>

            <SectionCard dense={dense}>
              <BiodataOccupationFields
                occupationType={form.occupationType}
                occupation={form.occupation}
                occupationDesignation={form.occupationDesignation}
                onTypeChange={(value) => updateField('occupationType', value)}
                onOccupationChange={(value) => updateField('occupation', value)}
                onDesignationChange={(value) => updateField('occupationDesignation', value)}
                editable={editable}
                dense={dense}
              />
              <View style={styles.fieldPairRow}>
                <View style={[styles.fieldPairItem, styles.fieldPairItemWide]}>
                  <BiodataRow
                    label={translate('biodataOccupationPosition')}
                    value={form.occupationDesignation}
                    onChangeText={(text) => updateField('occupationDesignation', text)}
                    editable={editable}
                    dense={dense}
                    placeholder={translate('occupationPositionPlaceholder')}
                    icon="title"
                  />
                </View>
                <View style={[styles.fieldPairItem, styles.fieldPairItemCompact]}>
                  <BiodataSelectRow
                    label={translate('biodataFieldIncome')}
                    value={form.monthlyIncome}
                    onValueChange={(text) => updateField('monthlyIncome', text)}
                    optionsKey="monthlyIncome"
                    editable={editable}
                    dense={dense}
                    icon="payments"
                    narrow
                  />
                </View>
              </View>
              <BiodataPropertyField
                label={translate('biodataFieldProperty')}
                propertyDetails={form.propertyDetails}
                legacyHouseType={form.propertyHouseType}
                legacyHouseCount={form.propertyHouseCount}
                onSave={(serialized) => {
                  setForm((current) => ({
                    ...current,
                    propertyDetails: serialized,
                    propertyHouseType: '',
                    propertyHouseCount: '',
                  }));
                }}
                editable={editable}
                dense={dense}
              />
            </SectionCard>

            <SectionCard dense={dense}>
              <View
                style={[
                  styles.fieldPairRow,
                  stacked && !isReviewStep && styles.fieldPairRowStacked,
                ]}
              >
                <View style={styles.fieldPairItem}>
                  <BiodataRow
                    label={translate('biodataFieldFather')}
                    value={form.fatherName}
                    onChangeText={(text) => updateField('fatherName', text)}
                    editable={editable}
                    dense={dense}
                    icon="person"
                  />
                </View>
                <View style={styles.fieldPairItem}>
                  <BiodataRow
                    label={translate('biodataFieldMother')}
                    value={form.motherName}
                    onChangeText={(text) => updateField('motherName', text)}
                    editable={editable}
                    dense={dense}
                    icon="person"
                  />
                </View>
              </View>
            </SectionCard>

            <SectionCard dense={dense}>
              <BiodataRow
                label={translate('biodataFieldResidence')}
                value={form.irupidam}
                onChangeText={(text) => updateField('irupidam', text)}
                editable={editable}
                dense={dense}
                icon="location-on"
              />
            </SectionCard>
    </>
  );

  const rightColumn = (
    <View style={[styles.leftColumn, styles.leftColumnFull]}>
      <SectionCard dense={dense}>
        <BiodataSelectRow
          label={translate('biodataFieldTotalMembers')}
          value={form.totalFamilyMembers}
          onValueChange={(text) => updateField('totalFamilyMembers', text)}
          optionsKey="siblingCount"
          editable={editable}
          dense={dense}
          icon="groups"
        />
        <RadioOptionGroup
          label={translate('biodataFieldBirthOrder')}
          value={form.birthOrder}
          optionsKey="birthOrder"
          onValueChange={(text) => updateField('birthOrder', text)}
          editable={editable}
          dense={dense}
          twoColumn
        />
      </SectionCard>

      <SectionCard dense={dense}>
        <View style={styles.fieldPairRow}>
          <View style={styles.fieldPairItem}>
            <SiblingSidebarSection
              title={translate('biodataFieldMarried')}
              fieldKeys={{
                elderBrother: 'marriedBrother',
                youngerBrother: 'marriedYoungerBrother',
                elderSister: 'marriedSister',
                youngerSister: 'marriedYoungerSister',
              }}
              form={form}
              onFieldChange={updateField}
              editable={editable}
              dense={dense}
            />
          </View>
          <View style={styles.fieldPairItem}>
            <SiblingSidebarSection
              title={translate('biodataFieldUnmarried')}
              fieldKeys={{
                elderBrother: 'unmarriedBrother',
                youngerBrother: 'unmarriedYoungerBrother',
                elderSister: 'unmarriedSister',
                youngerSister: 'unmarriedYoungerSister',
              }}
              form={form}
              onFieldChange={updateField}
              editable={editable}
              dense={dense}
            />
          </View>
        </View>
      </SectionCard>

      <SectionCard dense={dense}>
        <RadioOptionGroup
          label={translate('biodataFieldComplexion')}
          value={form.complexion}
          optionsKey="complexionBiodata"
          onValueChange={(text) => updateField('complexion', text)}
          editable={editable}
          dense={dense}
          threeColumn
        />
      </SectionCard>

      <SectionCard dense={dense}>
        <View style={styles.fieldPairRow}>
          <View style={styles.fieldPairItem}>
            <BiodataSelectRow
              label={translate('biodataFieldHeight')}
              value={form.height}
              onValueChange={(text) => updateField('height', text)}
              optionsKey="height"
              editable={editable}
              dense={dense}
              placeholder={translate('selectHeight')}
              icon="straighten"
            />
          </View>
          <View style={styles.fieldPairItem}>
            <BiodataSelectRow
              label={translate('biodataFieldSeervarisai')}
              value={form.seervarisai}
              onValueChange={(text) => updateField('seervarisai', text)}
              optionsKey="seervarisai"
              editable={editable}
              dense={dense}
              icon="diamond"
            />
          </View>
        </View>
      </SectionCard>
    </View>
  );

  const biodataSheet = (
    <View
      style={[
        styles.sheetCard,
        dense && styles.sheetCardDense,
        isChristianReview && styles.sheetCardFullScreen,
        step === 3 && styles.sheetCardReviewStep,
      ]}
    >
      {step === 1 ? (
        <View style={[styles.leftColumn, styles.leftColumnFull]}>{leftColumn}</View>
      ) : null}
      {step === 2 ? rightColumn : null}
      {step === 3 ? (
        <BiodataReviewSheet
          form={form}
          language={language}
          translate={translate}
          rasiChart={rasiChart}
          amsamChart={amsamChart}
          detailGrid={detailGrid}
          onFieldChange={updateField}
          onRasiChartChange={setRasiChart}
          onAmsamChartChange={setAmsamChart}
          onDetailGridChange={setDetailGrid}
          editable={reviewEditable}
          dense={dense}
          registrationCommunity={registrationCommunity}
          religion={religion}
        />
      ) : null}
    </View>
  );

  return (
    <View style={[styles.wrapper, isChristianReview && styles.wrapperFullScreen]}>
      {isChristianReview ? (
        <View style={styles.fullScreenReviewContainer}>{biodataSheet}</View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scrollContent, dense && styles.scrollContentDense]}
        >
          {biodataSheet}
        </ScrollView>
      )}

      {!hideActionBar ? (
      <View
        nativeID="biodata-action-bar"
        style={[styles.actionBar, isChristianReview && styles.actionBarFullScreen]}
      >
        {viewOnly ? (
          <Pressable
            style={({ pressed }) => [
              styles.actionButtonPrint,
              styles.actionButtonPrintFull,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={handlePrintPress}
          >
            <MaterialIcons name="print" size={16} color={SHEET_BORDER} />
            <Text style={styles.actionButtonPrintText}>{translate('print')}</Text>
          </Pressable>
        ) : (
          <>
        {step > 1 ? (
          <Pressable
            style={({ pressed }) => [
              styles.actionButtonOutline,
              styles.actionButtonHalf,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={goToPreviousStep}
          >
            <MaterialIcons name="arrow-back" size={18} color={SHEET_BORDER} />
            <Text style={styles.actionButtonOutlineText}>{translate('back')}</Text>
          </Pressable>
        ) : null}
        {step < 3 ? (
          <Pressable
            style={({ pressed }) => [
              styles.actionButtonPrimary,
              step > 1 ? styles.actionButtonHalf : styles.actionButtonFull,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={goToNextStep}
          >
            <Text style={styles.actionButtonPrimaryText}>{translate('next')}</Text>
            <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimary} />
          </Pressable>
        ) : (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.actionButtonPrint,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={handlePrintPress}
            >
              <MaterialIcons name="print" size={16} color={SHEET_BORDER} />
              <Text style={styles.actionButtonPrintText}>{translate('print')}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButtonPrimary,
                styles.actionButtonHalf,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={handleSavePress}
            >
              <MaterialIcons name="check-circle" size={18} color={colors.onPrimary} />
              <Text style={styles.actionButtonPrimaryText}>{translate('saveAndContinue')}</Text>
            </Pressable>
          </>
        )}
          </>
        )}
      </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F3F7FC',
  },
  wrapperFullScreen: {
    backgroundColor: '#F3F7FC',
  },
  fullScreenReviewContainer: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? 88 : 80,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: 8,
    paddingBottom: 130,
    alignItems: 'stretch',
  },
  scrollContentCompact: {
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 120,
  },
  sheetCard: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.06)',
    ...cardShadow,
  },
  sheetCardDense: {
    padding: 12,
    borderRadius: 16,
  },
  sheetCardReviewStep: {
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    padding: 0,
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: { boxShadow: 'none' },
      default: {
        shadowOpacity: 0,
        elevation: 0,
      },
    }),
  },
  sheetCardFullScreen: {
    flex: 1,
    width: '100%',
    maxWidth: undefined,
    alignSelf: 'stretch',
    padding: 0,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.08)',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(87, 0, 0, 0.08)' },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
      },
    }),
  },
  columnsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  columnsRowReview: {
    flexWrap: 'nowrap',
    width: '100%',
  },
  columnsRowStacked: {
    flexDirection: 'column',
    gap: 10,
  },
  leftColumn: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  leftColumnSide: {
    flex: 1.72,
    minWidth: 0,
    gap: 6,
  },
  leftColumnFull: {
    flex: undefined,
    width: '100%',
    maxWidth: '100%',
  },
  rightColumn: {
    flex: 1,
    minWidth: 0,
    gap: 5,
    backgroundColor: SIDEBAR_PANEL_BG,
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.08)',
    ...fieldShadow,
  },
  rightColumnSide: {
    flex: 1,
    minWidth: 158,
    maxWidth: '36%',
    gap: 5,
  },
  rightColumnFull: {
    flex: undefined,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
  },
  rightColumnDense: {
    padding: 10,
    gap: 8,
    borderRadius: 12,
  },
  rightColumnFamilyStep: {
    flex: 1,
    gap: 6,
    padding: 8,
    justifyContent: 'space-between',
  },
  siblingFieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  siblingFieldGridItem: {
    width: '48%',
    flexGrow: 1,
    minWidth: 0,
  },
  siblingSidebarSection: {
    gap: 4,
    backgroundColor: SIDEBAR_CARD_BG,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.06)',
    flex: 1,
    minWidth: 0,
  },
  siblingSectionsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  siblingSectionsStacked: {
    flexDirection: 'column',
    gap: 6,
  },
  siblingSectionColumn: {
    flex: 1,
    minWidth: 0,
  },
  siblingSectionColumnStacked: {
    width: '100%',
    minWidth: 0,
  },
  siblingSidebarSectionDense: {
    padding: 0,
    gap: 5,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  siblingSidebarTitle: {
    color: colors.primary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.interSemi,
  },
  siblingSidebarTitleDense: {
    fontSize: 11,
    lineHeight: 14,
    marginBottom: 2,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.08)',
    borderRadius: 14,
    padding: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 4,
    overflow: 'visible',
  },
  sectionCardDense: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 6,
  },
  fieldPairRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  fieldPairRowStacked: {
    flexDirection: 'column',
    gap: 5,
  },
  fieldPairItem: {
    flex: 1,
    minWidth: 0,
  },
  fieldPairItemWide: {
    flex: 2.2,
  },
  fieldPairItemCompact: {
    flex: 0.9,
    maxWidth: 148,
  },
  iconFieldShell: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    borderRadius: 12,
    backgroundColor: FIELD_BG,
    overflow: 'hidden',
    minHeight: 40,
    ...fieldShadow,
  },
  iconFieldShellDesktop: {
    minHeight: 44,
    borderRadius: 12,
  },
  iconFieldBadge: {
    width: 34,
    minWidth: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: FIELD_BORDER,
    backgroundColor: '#ffffff',
  },
  iconFieldBadgePressed: {
    opacity: 0.75,
  },
  iconFieldBadgeDesktop: {
    width: 36,
    minWidth: 36,
  },
  iconFieldBody: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  horoscopeNote: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontFamily: fonts.inter,
    marginBottom: 8,
    marginTop: -2,
  },
  horoscopeNoteDesktop: {
    fontSize: 12,
    marginBottom: 10,
  },
  radioGroup: {
    gap: 6,
    backgroundColor: SIDEBAR_CARD_BG,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.06)',
  },
  radioGroupDesktop: {
    gap: 8,
    padding: 10,
    borderRadius: 14,
  },
  radioGroupLabel: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: fonts.interSemi,
    textAlign: 'center',
  },
  radioGroupLabelDesktop: {
    fontSize: 12,
    textAlign: 'left',
    color: colors.primary,
    fontFamily: fonts.interSemi,
    marginBottom: 2,
  },
  radioGrid: {
    gap: 6,
  },
  radioGridDesktop: {
    gap: 8,
  },
  radioGridTwoColumn: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioChipHalf: {
    width: '48%',
    minWidth: 0,
  },
  radioGridThreeColumn: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 6,
  },
  radioChipThird: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 6,
    gap: 4,
    justifyContent: 'center',
  },
  radioChipFull: {
    width: '100%',
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  radioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.1)',
    backgroundColor: colors.surfaceContainerLowest,
    minWidth: 0,
  },
  radioChipDesktop: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  radioChipSelected: {
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(87, 0, 0, 0.25)',
    backgroundColor: '#fff',
    flexShrink: 0,
  },
  radioDotDense: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  radioDotSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radioChipText: {
    flex: 1,
    minWidth: 0,
    color: colors.onSurface,
    fontSize: 10,
    fontFamily: fonts.interMedium,
    textAlign: 'left',
  },
  radioChipTextDesktop: {
    fontSize: 12,
  },
  radioChipTextSelected: {
    color: colors.primary,
    fontFamily: fonts.interSemi,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldGroupMobile: {
    gap: 2,
  },
  fieldGroupDesktop: {
    gap: 6,
  },
  fieldLabel: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: fonts.interSemi,
    letterSpacing: 0.35,
    opacity: 0.88,
  },
  fieldLabelMobile: {
    fontSize: 9,
    lineHeight: 12,
  },
  fieldLabelDesktop: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 1,
  },
  fieldInput: {
    backgroundColor: FIELD_BG,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
    minHeight: 34,
    color: colors.onSurface,
    fontSize: 13,
    fontFamily: fonts.interMedium,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    ...fieldShadow,
  },
  fieldInputMobile: {
    minHeight: 32,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    borderRadius: 10,
  },
  fieldInputDesktop: {
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderRadius: 12,
  },
  fieldInputWithIcon: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: { boxShadow: 'none' },
      default: {
        shadowOpacity: 0,
        elevation: 0,
      },
    }),
  },
  nameDegreeRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  nameDegreeInput: {
    flex: 1,
    minWidth: 0,
  },
  nameDegreeDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: FIELD_BORDER,
    marginVertical: 4,
  },
  nameDegreeSelect: {
    flex: 1,
    minWidth: 148,
    maxWidth: '52%',
    flexShrink: 0,
  },
  fieldInputMultiline: {
    minHeight: 48,
    textAlignVertical: 'top',
    paddingTop: 6,
  },
  fieldInputMultilineMobile: {
    minHeight: 40,
  },
  fieldInputMultilineDesktop: {
    minHeight: 64,
    paddingTop: 10,
  },
  fieldInputReadonly: {
    backgroundColor: colors.surfaceContainerHigh,
    opacity: 0.96,
  },
  fieldReadonlyText: {
    color: colors.onSurface,
    fontSize: 13,
    fontFamily: fonts.interMedium,
  },
  selectFieldGroup: {
    position: 'relative',
    zIndex: 1,
    overflow: 'visible',
  },
  memberSelectWrap: {
    flex: 1,
    minWidth: 0,
  },
  metricBox: {
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    backgroundColor: FIELD_BG,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
  },
  metricBoxSidebar: {
    padding: 4,
    borderRadius: 10,
    backgroundColor: SIDEBAR_CARD_BG,
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.06)',
  },
  metricBoxSidebarDesktop: {
    padding: 10,
    borderRadius: 14,
  },
  metricBoxRegistration: {
    backgroundColor: '#FFF0ED',
  },
  metricBoxMobile: {
    padding: spacing.xs,
  },
  metricBoxSidebarMobile: {
    padding: 4,
    borderRadius: 8,
  },
  metricLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    fontFamily: fonts.interSemi,
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  metricLabelSidebar: {
    fontSize: 8,
    marginBottom: 2,
    textAlign: 'center',
    lineHeight: 10,
    color: colors.primary,
    opacity: 0.9,
  },
  metricLabelSidebarDesktop: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
    textAlign: 'left',
    color: colors.primary,
    fontFamily: fonts.interSemi,
  },
  metricLabelMobile: {
    fontSize: 8,
    marginBottom: 3,
  },
  metricLabelSidebarMobile: {
    fontSize: 8,
    lineHeight: 11,
    marginBottom: 3,
  },
  metricInput: {
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    borderRadius: 10,
    minHeight: 34,
    paddingHorizontal: spacing.sm,
    color: colors.onSurface,
    fontSize: 13,
    fontFamily: fonts.inter,
    backgroundColor: colors.surfaceContainerLowest,
  },
  metricInputSidebar: {
    minHeight: 26,
    paddingHorizontal: 3,
    fontSize: 10,
    fontFamily: fonts.interSemi,
    textAlign: 'center',
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(87, 0, 0, 0.1)',
  },
  metricInputMobile: {
    minHeight: 36,
    fontSize: 13,
  },
  metricInputSidebarMobile: {
    minHeight: 22,
    fontSize: 9,
    paddingHorizontal: 2,
  },
  metricInputRegistration: {
    minWidth: 88,
    fontSize: 10,
    letterSpacing: -0.2,
  },
  metricInputRegistrationMobile: {
    minWidth: 72,
    fontSize: 9,
  },
  regScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  memberBox: {
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    gap: spacing.xs,
    backgroundColor: FIELD_BG,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
  },
  memberBoxSidebar: {
    padding: 3,
    gap: 3,
    borderRadius: 10,
    backgroundColor: SIDEBAR_CARD_BG,
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.06)',
  },
  memberBoxMobile: {
    padding: spacing.xs,
    gap: 4,
  },
  memberBoxSidebarMobile: {
    padding: 3,
    gap: 2,
  },
  memberTitle: {
    color: SHEET_BORDER,
    fontSize: 10,
    fontFamily: fonts.interSemi,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  memberTitleSidebar: {
    fontSize: 8,
    textAlign: 'center',
    lineHeight: 10,
    marginBottom: 3,
    color: colors.primary,
    fontFamily: fonts.interSemi,
    letterSpacing: 0.3,
  },
  memberTitleMobile: {
    fontSize: 8,
    marginBottom: 2,
  },
  memberTitleSidebarMobile: {
    fontSize: 8,
    lineHeight: 11,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  memberRowSidebar: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 3,
  },
  memberLabel: {
    width: 62,
    flexShrink: 0,
    color: colors.onSurfaceVariant,
    fontSize: 10,
    fontFamily: fonts.interMedium,
  },
  memberLabelSidebar: {
    width: '100%',
    fontSize: 8,
    lineHeight: 11,
    textAlign: 'center',
    color: colors.onSurfaceVariant,
  },
  memberLabelMobile: {
    width: 64,
    fontSize: 9,
  },
  memberLabelSidebarMobile: {
    width: '100%',
    fontSize: 8,
    lineHeight: 10,
  },
  memberInput: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    borderRadius: 10,
    minHeight: 32,
    paddingHorizontal: 6,
    color: colors.onSurface,
    fontSize: 12,
    fontFamily: fonts.inter,
    backgroundColor: colors.surfaceContainerLowest,
  },
  memberInputSidebar: {
    width: '100%',
    minHeight: 22,
    paddingHorizontal: 3,
    textAlign: 'center',
    fontSize: 10,
    fontFamily: fonts.interSemi,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLowest,
  },
  memberInputMobile: {
    minHeight: 28,
    fontSize: 11,
  },
  memberInputSidebarMobile: {
    minHeight: 22,
    fontSize: 9,
    paddingHorizontal: 2,
  },
  chartsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    width: '100%',
  },
  chartsRowDense: {
    gap: 6,
  },
  horoscopeSection: {
    width: '100%',
    marginTop: spacing.sm,
    gap: 8,
    overflow: 'visible',
  },
  horoscopeSectionDense: {
    marginTop: 6,
    gap: 6,
  },
  detailGridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailGridTitle: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.interSemi,
  },
  detailGridTitleDesktop: {
    fontSize: 14,
    fontFamily: fonts.playfairSemi,
  },
  detailGridWrap: {
    borderRadius: borderRadius.sm,
    overflow: 'visible',
  },
  horoscopeFooterCard: {
    width: '100%',
    backgroundColor: FIELD_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    flexDirection: 'column',
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
    ...fieldShadow,
  },
  horoscopeFooterCardDense: {
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 6,
  },
  dasaBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
    width: '100%',
  },
  dasaBalanceRowDense: {
    gap: 4,
  },
  dasaBalanceTitle: {
    color: colors.onSurface,
    fontSize: 11,
    fontFamily: fonts.interSemi,
    flexShrink: 0,
    minWidth: 32,
    maxWidth: 40,
  },
  dasaBalanceTitleDense: {
    fontSize: 10,
    minWidth: 28,
    maxWidth: 36,
  },
  dasaDateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 0,
  },
  dasaDatePrefix: {
    color: colors.onSurface,
    fontSize: 10,
    lineHeight: 12,
    fontFamily: fonts.interSemi,
    flexShrink: 0,
  },
  dasaDatePrefixDense: {
    fontSize: 9,
    lineHeight: 11,
  },
  dasaInlineSelect: {
    flexShrink: 0,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceContainerLowest,
    overflow: 'hidden',
  },
  dasaPlanetSelectWrap: {
    flex: 1,
    minWidth: 72,
    maxWidth: 110,
  },
  dasaYearSelectWrap: {
    width: 60,
    minWidth: 60,
  },
  dasaMonthSelectWrap: {
    width: 48,
    minWidth: 48,
  },
  dasaDaySelectWrap: {
    width: 48,
    minWidth: 48,
  },
  dasaReadonlyValue: {
    color: colors.onSurface,
    fontSize: 12,
    fontFamily: fonts.inter,
    minWidth: 40,
    textAlign: 'center',
  },
  dasaReadonlyValueDense: {
    fontSize: 11,
  },
  chartBox: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  chartBoxDense: {
    flex: 1,
    minWidth: 0,
  },
  chartDoubleOuter: {
    borderWidth: 2,
    borderColor: HOROSCOPE_RED,
    padding: 2,
    backgroundColor: '#fff',
    overflow: 'visible',
  },
  chartDoubleInner: {
    borderWidth: 1,
    borderColor: HOROSCOPE_RED,
    backgroundColor: '#fff',
    overflow: 'visible',
  },
  chartGrid: {
    width: '100%',
    aspectRatio: 1,
    minHeight: Platform.OS === 'web' ? 170 : undefined,
    flexDirection: 'column',
    backgroundColor: HOROSCOPE_RED,
    gap: 1,
    overflow: 'visible',
  },
  chartGridCompact: {
    aspectRatio: 1,
  },
  chartGridDense: {
    aspectRatio: 1,
    minHeight: Platform.OS === 'web' ? 118 : undefined,
  },
  chartGridRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 1,
  },
  chartGridRowDouble: {
    flex: 2,
    flexDirection: 'row',
    gap: 1,
  },
  chartSideStack: {
    flex: 1,
    flexDirection: 'column',
    gap: 1,
  },
  chartCellWrap: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 0,
    minWidth: 0,
  },
  chartCellWrapCompact: {},
  chartCellPressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 1,
  },
  chartCellPressableFilled: {
    backgroundColor: 'rgba(87, 0, 0, 0.06)',
  },
  chartCellText: {
    width: '100%',
    fontSize: 11,
    lineHeight: 14,
    color: HOROSCOPE_RED,
    fontFamily: fonts.interSemi,
    textAlign: 'center',
  },
  chartCellTextCompact: {
    fontSize: 10,
    lineHeight: 13,
  },
  chartCellTextEmpty: {
    color: 'rgba(87, 0, 0, 0.2)',
  },
  pickerModalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  pickerModalCard: {
    width: '100%',
    maxWidth: 300,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: HOROSCOPE_RED,
    paddingVertical: 12,
    paddingHorizontal: 12,
    zIndex: 2,
    ...Platform.select({
      web: { boxShadow: '0 12px 32px rgba(87, 0, 0, 0.22)' },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 16,
        elevation: 12,
      },
    }),
  },
  pickerModalTitle: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: fonts.interSemi,
    textAlign: 'center',
    marginBottom: 10,
  },
  pickerModalScroll: {
    maxHeight: 360,
  },
  pickerModalScrollContent: {
    paddingBottom: 4,
  },
  pickerModalPlanetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  pickerModalPlanetOption: {
    width: '28%',
    minWidth: 64,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.15)',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  pickerModalPlanetOptionText: {
    fontSize: 16,
    color: HOROSCOPE_RED,
    fontFamily: fonts.interSemi,
    textAlign: 'center',
  },
  pickerModalNumberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  pickerModalNumberOption: {
    width: 44,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  pickerModalNumberOptionText: {
    fontSize: 13,
    color: HOROSCOPE_RED,
    fontFamily: fonts.interSemi,
    textAlign: 'center',
  },
  pickerModalOptionSelected: {
    backgroundColor: 'rgba(87, 0, 0, 0.12)',
    borderColor: HOROSCOPE_RED,
  },
  pickerModalOptionTextSelected: {
    color: colors.primary,
  },
  pickerModalClearButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(87, 0, 0, 0.12)',
  },
  pickerModalClearButtonText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.interSemi,
  },
  chartCellInput: {
    width: '100%',
    flex: 1,
    fontSize: 10,
    color: '#111',
    padding: 2,
    backgroundColor: 'transparent',
  },
  chartCellInputCompact: {
    fontSize: 8,
    padding: 1,
  },
  chartCenter: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 2,
    paddingVertical: 4,
    gap: 2,
    minWidth: 0,
  },
  chartCenterCompact: {
    paddingHorizontal: 2,
    paddingVertical: 4,
    gap: 2,
  },
  chartCenterLabel: {
    color: HOROSCOPE_RED,
    fontSize: 14,
    fontFamily: fonts.playfairSemi,
    textAlign: 'center',
  },
  chartCenterLabelCompact: {
    fontSize: 12,
  },
  dasaRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  dasaRowCompact: {
    gap: 4,
  },
  dasaLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    lineHeight: 14,
    fontFamily: fonts.interSemi,
    flexShrink: 0,
  },
  dasaLabelCompact: {
    fontSize: 9,
  },
  dasaLabelDesktop: {
    fontSize: 12,
  },
  dasaInput: {
    width: 80,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    borderRadius: borderRadius.md,
    minHeight: 36,
    paddingHorizontal: 6,
    color: colors.onSurface,
    fontSize: 12,
    fontFamily: fonts.inter,
    backgroundColor: colors.surfaceContainerLowest,
    flexShrink: 0,
  },
  dasaInputCompact: {
    width: 64,
    minHeight: 32,
    fontSize: 11,
  },
  dasaInputDesktop: {
    width: 90,
    minHeight: 40,
    fontSize: 13,
  },
  dasaInputSmall: {
    width: 52,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    borderRadius: borderRadius.md,
    minHeight: 34,
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: 'center',
    color: colors.onSurface,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.inter,
    backgroundColor: colors.surfaceContainerLowest,
    flexShrink: 0,
  },
  dasaInputSmallCompact: {
    width: 34,
    minHeight: 32,
    fontSize: 11,
  },
  dasaInputSmallDesktop: {
    width: 48,
    minHeight: 40,
    fontSize: 13,
  },
  detailGrid: {
    borderWidth: 1,
    borderColor: HOROSCOPE_RED,
    overflow: 'visible',
  },
  detailGridRow: {
    flexDirection: 'row',
    overflow: 'visible',
  },
  detailGridContainer: {
    position: 'relative',
  },
  detailGridBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 15,
  },
  detailCellWrap: {
    flex: 1,
    borderWidth: 1,
    borderColor: HOROSCOPE_RED,
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 22,
    minWidth: 0,
    backgroundColor: '#fff',
  },
  detailCellWrapDense: {
    minHeight: 20,
  },
  detailCellText: {
    width: '100%',
    fontSize: 9,
    lineHeight: 12,
    color: HOROSCOPE_RED,
    fontFamily: fonts.interSemi,
    textAlign: 'center',
  },
  detailCellTextDense: {
    fontSize: 8,
    lineHeight: 11,
  },
  detailCellInput: {
    width: '100%',
    minHeight: 20,
    fontSize: 9,
    lineHeight: 12,
    color: colors.primary,
    fontFamily: fonts.interSemi,
    paddingHorizontal: 0,
    paddingVertical: 0,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  detailCellInputDense: {
    minHeight: 18,
    fontSize: 8,
    lineHeight: 11,
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(87, 0, 0, 0.08)',
    ...actionBarShadow,
  },
  actionBarFullScreen: {
    paddingHorizontal: spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  actionBarCompact: {
    flexDirection: 'column',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
  },
  actionSecondaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  actionButtonFull: {
    width: '100%',
    flex: undefined,
  },
  actionButtonHalf: {
    flex: 1,
  },
  actionButtonPrint: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(87, 0, 0, 0.22)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.surfaceContainerLowest,
    minHeight: 40,
    ...fieldShadow,
  },
  actionButtonPrintText: {
    color: SHEET_BORDER,
    fontFamily: fonts.interSemi,
    fontSize: 12,
    lineHeight: 16,
  },
  actionButtonPrintFull: {
    flex: 1,
    maxWidth: 140,
    alignSelf: 'center',
  },
  actionButtonPressed: {
    opacity: 0.88,
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(87, 0, 0, 0.22)',
    borderRadius: 14,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    minWidth: 0,
    minHeight: 48,
    ...fieldShadow,
  },
  actionButtonOutlineMobile: {
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    minHeight: 44,
    borderRadius: borderRadius.md,
  },
  actionButtonOutlineText: {
    color: SHEET_BORDER,
    fontFamily: fonts.interSemi,
    fontSize: 13,
    flexShrink: 1,
  },
  actionButtonOutlineTextMobile: {
    fontSize: 10,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    minWidth: 0,
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    ...Platform.select({
      web: {
        boxShadow: '0 6px 20px rgba(87, 0, 0, 0.32)',
      },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.32,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
  actionButtonPrimaryCompact: {
    minHeight: 44,
    borderRadius: borderRadius.md,
  },
  iconFieldShellDense: {
    minHeight: 42,
    borderRadius: 12,
  },
  iconFieldBadgeDense: {
    width: 32,
    minWidth: 32,
  },
  radioGroupDense: {
    gap: 6,
    padding: 8,
    borderRadius: 12,
  },
  radioGroupLabelDense: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'left',
    color: colors.primary,
    fontFamily: fonts.interSemi,
    marginBottom: 4,
  },
  radioGridDense: {
    gap: 6,
  },
  radioGridInlineRow: {
    flexDirection: 'row',
    gap: 4,
  },
  radioChipInline: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  radioChipDense: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 4,
    minHeight: 38,
  },
  radioChipTextDense: {
    fontSize: 10,
    lineHeight: 13,
  },
  radioChipTextThird: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
  radioGroupFamilyCompact: {
    gap: 4,
    padding: 6,
  },
  radioGroupLabelFamilyCompact: {
    fontSize: 10,
    lineHeight: 12,
    marginBottom: 2,
  },
  radioGridFamilyCompact: {
    gap: 4,
  },
  radioChipFamilyCompact: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 32,
  },
  radioChipTextFull: {
    fontSize: 11,
    lineHeight: 14,
  },
  fieldGroupNarrow: {
    flex: 1,
    minWidth: 0,
    gap: 2,
    overflow: 'visible',
  },
  fieldLabelNarrow: {
    fontSize: 9,
    lineHeight: 12,
    minHeight: 12,
    textAlign: 'left',
  },
  narrowSelectShell: {
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    borderRadius: 10,
    backgroundColor: FIELD_BG,
    minHeight: 32,
    justifyContent: 'center',
    overflow: 'visible',
    ...fieldShadow,
  },
  narrowSelectShellDense: {
    minHeight: 38,
    borderRadius: 10,
  },
  fieldGroupDense: {
    gap: 6,
  },
  fieldLabelDense: {
    fontSize: 11,
    lineHeight: 15,
    opacity: 1,
  },
  requiredMark: {
    color: colors.error,
    fontFamily: fonts.interSemi,
  },
  dateFieldShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    borderRadius: 12,
    backgroundColor: FIELD_BG,
    minHeight: 40,
    overflow: 'hidden',
    ...fieldShadow,
  },
  dateFieldShellDense: {
    minHeight: 42,
    borderRadius: 12,
  },
  dateFieldInput: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: fonts.interMedium,
    color: colors.onSurface,
    borderWidth: 0,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: { outlineStyle: 'none' },
      default: {},
    }),
  },
  dateFieldInputDense: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  dateFieldIconButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateFieldIconButtonDense: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  datePickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  datePickerSheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: spacing.lg,
  },
  datePickerDoneBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  datePickerDoneText: {
    color: colors.onPrimary,
    fontFamily: fonts.interSemi,
    fontSize: 14,
  },
  fieldInputDense: {
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    borderRadius: 10,
  },
  fieldInputMultilineDense: {
    minHeight: 36,
    paddingTop: 6,
  },
  metricBoxSidebarDense: {
    padding: 8,
    borderRadius: 12,
  },
  metricBoxDense: {
    padding: 8,
  },
  metricLabelSidebarDense: {
    fontSize: 11,
    lineHeight: 14,
    marginBottom: 4,
    textAlign: 'left',
    color: colors.primary,
    fontFamily: fonts.interSemi,
  },
  metricLabelDense: {
    fontSize: 11,
  },
  metricInputSidebarDense: {
    minHeight: 38,
    fontSize: 12,
    paddingHorizontal: 8,
  },
  metricInputDense: {
    minHeight: 38,
    fontSize: 12,
  },
  metricBoxSidebarCompact: {
    padding: 4,
    borderRadius: 10,
    backgroundColor: SIDEBAR_CARD_BG,
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.06)',
  },
  metricBoxSidebarCompactDense: {
    padding: 4,
    gap: 2,
  },
  metricLabelSidebarCompact: {
    fontSize: 9,
    lineHeight: 11,
    marginBottom: 2,
    textAlign: 'left',
    color: colors.primary,
    fontFamily: fonts.interSemi,
  },
  metricLabelSidebarCompactDense: {
    fontSize: 9,
    lineHeight: 11,
    marginBottom: 2,
  },
  metricInputSidebarCompact: {
    minHeight: 30,
    fontSize: 11,
    paddingHorizontal: 4,
    textAlign: 'center',
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(87, 0, 0, 0.1)',
    borderWidth: 1,
    fontFamily: fonts.interSemi,
  },
  metricInputSidebarCompactDense: {
    minHeight: 30,
    fontSize: 11,
  },
  metricBoxFamilyCompact: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: SIDEBAR_CARD_BG,
    borderWidth: 1,
    borderColor: 'rgba(87, 0, 0, 0.06)',
  },
  metricBoxFamilyCompactDense: {
    padding: 6,
  },
  metricLabelFamilyCompact: {
    fontSize: 10,
    lineHeight: 12,
    marginBottom: 3,
    textAlign: 'left',
    color: colors.primary,
    fontFamily: fonts.interSemi,
  },
  metricLabelFamilyCompactDense: {
    fontSize: 10,
    lineHeight: 12,
    marginBottom: 3,
  },
  metricInputFamilyCompact: {
    minHeight: 34,
    fontSize: 11,
    paddingHorizontal: 6,
    textAlign: 'center',
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(87, 0, 0, 0.1)',
    borderWidth: 1,
    fontFamily: fonts.interSemi,
  },
  metricInputFamilyCompactDense: {
    minHeight: 34,
    fontSize: 11,
  },
  metricInputRegistrationDense: {
    minWidth: 64,
    fontSize: 10,
  },
  chartsRowSide: {
    gap: 8,
    marginTop: 4,
  },
  dasaLabelDense: {
    fontSize: 10,
    lineHeight: 13,
  },
  dasaInputSmallDense: {
    width: 48,
    minHeight: 32,
    paddingVertical: 5,
    fontSize: 12,
    lineHeight: 16,
  },
  detailGridTitleDense: {
    fontSize: 11,
  },
  scrollContentDense: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 72,
  },
  scrollContentFamilyStep: {
    flexGrow: 1,
    paddingTop: 2,
    paddingBottom: 76,
  },
  scrollFamilyStep: {
    flex: 1,
  },
  sheetCardFamilyStep: {
    flex: 1,
  },
  actionButtonPrimaryText: {
    color: colors.onPrimary,
    fontFamily: fonts.interSemi,
    fontSize: 14,
    flexShrink: 1,
  },
  actionButtonPrimaryTextCompact: {
    fontSize: 14,
  },
  occupationFieldsWrap: {
    gap: 8,
    overflow: 'visible',
    zIndex: 1,
  },
  narrowFieldInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    minHeight: 30,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 12,
    ...Platform.select({
      web: { boxShadow: 'none', outlineStyle: 'none' },
      default: {
        shadowOpacity: 0,
        elevation: 0,
      },
    }),
  },
  propertyFieldTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 6,
  },
  propertyFieldValue: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.interMedium,
  },
  propertyFieldPlaceholder: {
    flex: 1,
    color: PLACEHOLDER,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.inter,
  },
  bottomSheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 0, 0, 0.42)',
  },
  bottomSheetCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    maxHeight: '82%',
    ...fieldShadow,
  },
  bottomSheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(87, 0, 0, 0.18)',
    marginBottom: spacing.sm,
  },
  bottomSheetTitle: {
    color: colors.primary,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.playfairSemi,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  bottomSheetScroll: {
    maxHeight: 420,
  },
  bottomSheetScrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  bottomSheetActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  bottomSheetCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    backgroundColor: colors.surfaceContainerLowest,
  },
  bottomSheetCancelText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    fontFamily: fonts.interSemi,
  },
  bottomSheetSaveBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  bottomSheetSaveText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontFamily: fonts.interSemi,
  },
  propertySheetError: {
    color: colors.error,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.inter,
    textAlign: 'center',
  },
});
