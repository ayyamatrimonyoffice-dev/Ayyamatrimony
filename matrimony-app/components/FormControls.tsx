import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FormOptionsKey, getFormOptions, getOptionLabel } from '@/constants/formOptions';
import { Language } from '@/constants/i18n';
import { colors, spacing, typography } from '@/constants/theme';

export const formFieldStyles = StyleSheet.create({
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fieldInput: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.bodyMd,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: 'rgba(226, 191, 185, 0.2)',
  },
  fieldInputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  selectTrigger: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(226, 191, 185, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  selectValue: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
  },
  selectPlaceholder: {
    ...typography.bodyMd,
    color: 'rgba(90, 65, 61, 0.4)',
    flex: 1,
  },
});

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
};

export function TextField({ label, value, onChangeText, placeholder, multiline }: TextFieldProps) {
  return (
    <View style={formFieldStyles.fieldGroup}>
      <Text style={formFieldStyles.fieldLabel}>{label}</Text>
      <TextInput
        style={[formFieldStyles.fieldInput, multiline && formFieldStyles.fieldInputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(90, 65, 61, 0.4)"
        multiline={multiline}
      />
    </View>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  showLabel?: boolean;
};

export function SelectField({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  showLabel = true,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label;

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue);
    setOpen(false);
  };

  return (
    <View style={[formFieldStyles.fieldGroup, open && styles.fieldGroupOpen]}>
      {showLabel && label ? <Text style={formFieldStyles.fieldLabel}>{label}</Text> : null}
      <View style={styles.selectWrapper}>
        <Pressable
          style={[formFieldStyles.selectTrigger, open && styles.selectTriggerOpen]}
          onPress={() => setOpen((current) => !current)}
        >
          <Text style={selectedLabel ? formFieldStyles.selectValue : formFieldStyles.selectPlaceholder}>
            {selectedLabel ?? placeholder}
          </Text>
          <MaterialIcons
            name={open ? 'expand-less' : 'expand-more'}
            size={22}
            color={colors.onSurfaceVariant}
          />
        </Pressable>

        {open ? (
          <View style={styles.inlineDropdown}>
            <ScrollView
              style={styles.inlineOptionsList}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    onPress={() => handleSelect(option.value)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {option.label}
                    </Text>
                    {isSelected ? (
                      <MaterialIcons name="check" size={20} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </View>
  );
}

type SelectOptionsFieldProps = {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  optionsKey: FormOptionsKey;
  language: Language;
  placeholder?: string;
};

export function SelectOptionsField({
  label,
  value,
  onValueChange,
  optionsKey,
  language,
  placeholder,
}: SelectOptionsFieldProps) {
  const options = useMemo(() => getFormOptions(optionsKey, language), [optionsKey, language]);
  return (
    <SelectField
      label={label}
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder={placeholder}
    />
  );
}

function formatDate(day: number, month: number, year: number) {
  const dayText = String(day).padStart(2, '0');
  const monthText = String(month).padStart(2, '0');
  return `${dayText} / ${monthText} / ${year}`;
}

function parseDate(value: string): { day: number; month: number; year: number } | null {
  const parts = value.split('/').map((part) => part.trim());
  if (parts.length !== 3) {
    return null;
  }
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) {
    return null;
  }
  return { day, month, year };
}

const MIN_MATRIMONY_AGE = 18;
const MAX_MATRIMONY_AGE = 65;

function getBirthYearRange() {
  const currentYear = new Date().getFullYear();
  return {
    minYear: currentYear - MAX_MATRIMONY_AGE,
    maxYear: currentYear - MIN_MATRIMONY_AGE,
  };
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

const MONTH_LABELS: Record<Language, string[]> = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  ta: [
    'ஜனவரி',
    'பிப்ரவரி',
    'மார்ச்',
    'ஏப்ரல்',
    'மே',
    'ஜூன்',
    'ஜூலை',
    'ஆகஸ்ட்',
    'செப்டம்பர்',
    'அக்டோபர்',
    'நவம்பர்',
    'டிசம்பர்',
  ],
};

const DATE_PICKER_LABELS: Record<Language, { day: string; month: string; year: string; done: string }> = {
  en: { day: 'Day', month: 'Month', year: 'Year', done: 'Done' },
  ta: { day: 'நாள்', month: 'மாதம்', year: 'ஆண்டு', done: 'முடிந்தது' },
};

type DateParts = {
  day: number;
  month: number;
  year: number;
};

function getDefaultDateParts(): DateParts {
  return { day: 15, month: 8, year: 1995 };
}

type DateColumnProps = {
  title: string;
  items: { value: number; label: string }[];
  selected: number;
  onSelect: (value: number) => void;
};

function DateColumn({ title, items, selected, onSelect }: DateColumnProps) {
  return (
    <View style={styles.dateColumn}>
      <Text style={styles.dateColumnTitle}>{title}</Text>
      <ScrollView style={styles.dateColumnList} nestedScrollEnabled showsVerticalScrollIndicator>
        {items.map((item) => {
          const isSelected = item.value === selected;
          return (
            <Pressable
              key={`${title}-${item.value}`}
              style={[styles.dateItem, isSelected && styles.dateItemSelected]}
              onPress={() => onSelect(item.value)}
            >
              <Text style={[styles.dateItemText, isSelected && styles.dateItemTextSelected]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

type InlineDateSelectorProps = {
  value: DateParts;
  language: Language;
  onChange: (parts: DateParts) => void;
  onDone: () => void;
};

function InlineDateSelector({ value, language, onChange, onDone }: InlineDateSelectorProps) {
  const { minYear, maxYear } = getBirthYearRange();
  const labels = DATE_PICKER_LABELS[language];
  const monthNames = MONTH_LABELS[language];

  const yearItems = useMemo(() => {
    const items = [];
    for (let year = maxYear; year >= minYear; year -= 1) {
      items.push({ value: year, label: String(year) });
    }
    return items;
  }, [maxYear, minYear]);

  const monthItems = useMemo(
    () => monthNames.map((label, index) => ({ value: index + 1, label })),
    [monthNames],
  );

  const dayItems = useMemo(() => {
    const totalDays = getDaysInMonth(value.year, value.month);
    return Array.from({ length: totalDays }, (_, index) => {
      const day = index + 1;
      return { value: day, label: String(day).padStart(2, '0') };
    });
  }, [value.month, value.year]);

  const handleYearChange = (year: number) => {
    const maxDay = getDaysInMonth(year, value.month);
    onChange({ ...value, year, day: Math.min(value.day, maxDay) });
  };

  const handleMonthChange = (month: number) => {
    const maxDay = getDaysInMonth(value.year, month);
    onChange({ ...value, month, day: Math.min(value.day, maxDay) });
  };

  return (
    <View style={styles.dateSelector}>
      <View style={styles.dateColumns}>
        <DateColumn
          title={labels.day}
          items={dayItems}
          selected={value.day}
          onSelect={(day) => onChange({ ...value, day })}
        />
        <DateColumn
          title={labels.month}
          items={monthItems}
          selected={value.month}
          onSelect={handleMonthChange}
        />
        <DateColumn
          title={labels.year}
          items={yearItems}
          selected={value.year}
          onSelect={handleYearChange}
        />
      </View>
      <Pressable style={styles.dateDoneButton} onPress={onDone}>
        <Text style={styles.doneText}>{labels.done}</Text>
      </Pressable>
    </View>
  );
}

type DatePickerFieldProps = {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  language: Language;
};

export function DatePickerField({
  label,
  value,
  onValueChange,
  placeholder,
  language,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [dateParts, setDateParts] = useState<DateParts>(() => parseDate(value) ?? getDefaultDateParts());
  const displayValue = value || '';

  useEffect(() => {
    const parsed = parseDate(value);
    if (parsed) {
      setDateParts(parsed);
    }
  }, [value]);

  const commitDate = (parts: DateParts) => {
    setDateParts(parts);
    onValueChange(formatDate(parts.day, parts.month, parts.year));
  };

  const handleDone = () => {
    commitDate(dateParts);
    setOpen(false);
  };

  return (
    <View style={[formFieldStyles.fieldGroup, open && styles.fieldGroupOpen]}>
      <Text style={formFieldStyles.fieldLabel}>{label}</Text>
      <View style={styles.selectWrapper}>
        <Pressable
          style={[formFieldStyles.selectTrigger, open && styles.selectTriggerOpen]}
          onPress={() => setOpen((current) => !current)}
        >
          <Text style={displayValue ? formFieldStyles.selectValue : formFieldStyles.selectPlaceholder}>
            {displayValue || placeholder}
          </Text>
          <MaterialIcons
            name={open ? 'expand-less' : 'calendar-today'}
            size={20}
            color={colors.onSurfaceVariant}
          />
        </Pressable>

        {open ? (
          <View style={styles.inlineDropdown}>
            <InlineDateSelector
              value={dateParts}
              language={language}
              onChange={commitDate}
              onDone={handleDone}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function getStoredSelectLabel(
  optionsKey: FormOptionsKey,
  value: string,
  language: Language,
) {
  return getOptionLabel(optionsKey, value, language);
}

const styles = StyleSheet.create({
  fieldGroupOpen: {
    zIndex: 30,
    position: 'relative',
  },
  selectWrapper: {
    position: 'relative',
    width: '100%',
  },
  selectTriggerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainerLowest,
  },
  inlineDropdown: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.primary,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: colors.surfaceContainerLowest,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 20px rgba(20, 29, 35, 0.12)',
      },
      default: {
        elevation: 6,
        shadowColor: '#141d23',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
    }),
  },
  inlineOptionsList: {
    maxHeight: 220,
  },
  dateSelector: {
    paddingBottom: spacing.xs,
  },
  dateColumns: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xs,
  },
  dateColumn: {
    flex: 1,
    minWidth: 0,
  },
  dateColumnTitle: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  dateColumnList: {
    maxHeight: 180,
    borderWidth: 1,
    borderColor: 'rgba(226, 191, 185, 0.2)',
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLow,
  },
  dateItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 191, 185, 0.08)',
  },
  dateItemSelected: {
    backgroundColor: colors.surfaceContainerLow,
  },
  dateItemText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  dateItemTextSelected: {
    color: colors.primary,
    fontFamily: typography.labelLg.fontFamily,
  },
  dateDoneButton: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  doneText: {
    ...typography.labelLg,
    color: colors.primary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 191, 185, 0.1)',
  },
  optionRowSelected: {
    backgroundColor: colors.surfaceContainerLow,
  },
  optionText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
    paddingRight: spacing.sm,
  },
  optionTextSelected: {
    color: colors.primary,
    fontFamily: typography.labelLg.fontFamily,
  },
});
