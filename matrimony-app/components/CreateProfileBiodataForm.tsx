import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useProfileForm } from '@/context/ProfileFormContext';
import { useLanguage } from '@/context/LanguageContext';

import { images } from '@/constants/images';

const lotusLogo = images.logo;

const SHEET_RED = '#B00000';
const SHEET_BORDER = '#8B0000';

const HOROSCOPE_SIZE = 4;
const DETAIL_GRID_COUNT = 30;
const DETAIL_GRID_COLUMNS = 15;
const DETAIL_GRID_ROWS = 2;

type BiodataState = {
  fullName: string;
  dateOfBirth: string;
  natchathiram: string;
  rasi: string;
  occupation: string;
  monthlyIncome: string;
  propertyDetails: string;
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
};

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
    return Array.from({ length: DETAIL_GRID_COUNT }, () => '');
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return Array.from({ length: DETAIL_GRID_COUNT }, () => '');
    }
    return Array.from({ length: DETAIL_GRID_COUNT }, (_, index) =>
      typeof parsed[index] === 'string' ? parsed[index] : '',
    );
  } catch {
    return Array.from({ length: DETAIL_GRID_COUNT }, () => '');
  }
}

function BiodataRow({
  label,
  value,
  onChangeText,
  editable,
  multiline,
  mobile,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  multiline?: boolean;
  mobile?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, mobile && styles.rowLabelMobile]}>{label}</Text>
      <TextInput
        style={[
          styles.rowInput,
          mobile && styles.rowInputMobile,
          multiline && styles.rowInputMultiline,
          multiline && mobile && styles.rowInputMultilineMobile,
        ]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline={multiline}
        placeholderTextColor="rgba(139, 0, 0, 0.35)"
      />
    </View>
  );
}

function MetricBox({
  label,
  value,
  onChangeText,
  editable,
  mobile,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  mobile?: boolean;
}) {
  return (
    <View style={[styles.metricBox, mobile && styles.metricBoxMobile]}>
      <Text style={[styles.metricLabel, mobile && styles.metricLabelMobile]}>{label}</Text>
      <TextInput
        style={[styles.metricInput, mobile && styles.metricInputMobile]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholderTextColor="rgba(139, 0, 0, 0.35)"
      />
    </View>
  );
}

function MemberBox({
  title,
  fields,
  editable,
  onChange,
  mobile,
}: {
  title: string;
  fields: { key: keyof BiodataState; label: string; value: string }[];
  editable: boolean;
  onChange: (key: keyof BiodataState, value: string) => void;
  mobile?: boolean;
}) {
  return (
    <View style={[styles.memberBox, mobile && styles.memberBoxMobile]}>
      <Text style={[styles.memberTitle, mobile && styles.memberTitleMobile]}>{title}</Text>
      {fields.map((field) => (
        <View key={field.key} style={styles.memberRow}>
          <Text
            style={[styles.memberLabel, mobile && styles.memberLabelMobile]}
          >
            {field.label}
          </Text>
          <TextInput
            style={[styles.memberInput, mobile && styles.memberInputMobile]}
            value={field.value}
            onChangeText={(text) => onChange(field.key, text)}
            editable={editable}
            placeholderTextColor="rgba(139, 0, 0, 0.35)"
          />
        </View>
      ))}
    </View>
  );
}

function HoroscopeChart({
  cells,
  centerLabel,
  editable,
  onCellChange,
  mobile,
}: {
  cells: string[][];
  centerLabel: string;
  editable: boolean;
  onCellChange: (row: number, col: number, value: string) => void;
  mobile?: boolean;
}) {
  const renderCell = (row: number, col: number) => (
    <View
      key={`${row}-${col}`}
      style={[styles.chartCellWrap, mobile && styles.chartCellWrapMobile]}
    >
      <TextInput
        style={[styles.chartCellInput, mobile && styles.chartCellInputMobile]}
        value={cells[row][col]}
        onChangeText={(text) => onCellChange(row, col, text)}
        editable={editable}
        textAlign="center"
        placeholderTextColor="rgba(139, 0, 0, 0.25)"
      />
    </View>
  );

  return (
    <View style={styles.chartWrap}>
      <View style={[styles.chartGrid, mobile && styles.chartGridMobile]}>
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
          <View style={[styles.chartCenter, mobile && styles.chartCenterMobile]}>
            <Text
              style={[styles.chartCenterLabel, mobile && styles.chartCenterLabelMobile]}
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
  );
}

type CreateProfileBiodataFormProps = {
  editable: boolean;
  onSave: () => void;
  onDownloadPdf: () => void;
  onEditProfile: () => void;
};

export function CreateProfileBiodataForm({
  editable,
  onSave,
  onDownloadPdf,
  onEditProfile,
}: CreateProfileBiodataFormProps) {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 640;
  const { translate } = useLanguage();
  const { getValue, setValue, isReady } = useProfileForm();
  const [rasiChart, setRasiChart] = useState(emptyHoroscope);
  const [amsamChart, setAmsamChart] = useState(emptyHoroscope);
  const [detailGrid, setDetailGrid] = useState<string[]>(() =>
    Array.from({ length: DETAIL_GRID_COUNT }, () => ''),
  );
  const [form, setForm] = useState<BiodataState>({
    fullName: '',
    dateOfBirth: '',
    natchathiram: '',
    rasi: '',
    occupation: '',
    monthlyIncome: '',
    propertyDetails: '',
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
  });

  useEffect(() => {
    if (!isReady) {
      return;
    }

    setRasiChart(parseHoroscope(getValue('biodataHoroscopeRasi')));
    setAmsamChart(parseHoroscope(getValue('biodataHoroscopeAmsam')));
    setDetailGrid(parseDetailGrid(getValue('biodataDetailGrid')));
    setForm({
      fullName: getValue('fullName'),
      dateOfBirth: getValue('dateOfBirth'),
      natchathiram: getValue('natchathiram'),
      rasi: getValue('rasi'),
      occupation: getValue('occupation'),
      monthlyIncome: getValue('monthlyIncome'),
      propertyDetails: getValue('propertyDetails'),
      fatherName: getValue('fatherName'),
      motherName: getValue('motherName'),
      irupidam: getValue('irupidam') || getValue('nativePlace'),
      totalFamilyMembers: getValue('totalFamilyMembers'),
      birthOrder: getValue('birthOrder'),
      marriedBrother: getValue('marriedBrother'),
      marriedYoungerBrother: getValue('marriedYoungerBrother'),
      marriedSister: getValue('marriedSister'),
      marriedYoungerSister: getValue('marriedYoungerSister'),
      unmarriedBrother: getValue('unmarriedBrother'),
      unmarriedYoungerBrother: getValue('unmarriedYoungerBrother'),
      unmarriedSister: getValue('unmarriedSister'),
      unmarriedYoungerSister: getValue('unmarriedYoungerSister'),
      complexion: getValue('complexion'),
      height: getValue('height'),
      seervarisai: getValue('seervarisai'),
      dasaBalance: getValue('dasaBalance'),
      dasaYear: getValue('dasaYear'),
      dasaMonth: getValue('dasaMonth'),
      dasaDay: getValue('dasaDay'),
      registrationNumber: getValue('registrationNumber'),
    });
  }, [getValue, isReady]);

  const updateField = useCallback((key: keyof BiodataState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const persistForm = useCallback(() => {
    setValue('fullName', form.fullName.trim());
    setValue('dateOfBirth', form.dateOfBirth.trim());
    setValue('natchathiram', form.natchathiram.trim());
    setValue('rasi', form.rasi.trim());
    setValue('occupation', form.occupation.trim());
    setValue('monthlyIncome', form.monthlyIncome.trim());
    setValue('propertyDetails', form.propertyDetails.trim());
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
    setValue('registrationNumber', form.registrationNumber.trim());
    setValue('biodataHoroscopeRasi', JSON.stringify(rasiChart));
    setValue('biodataHoroscopeAmsam', JSON.stringify(amsamChart));
    setValue('biodataDetailGrid', JSON.stringify(detailGrid));
  }, [detailGrid, form, rasiChart, amsamChart, setValue]);

  const handleSavePress = useCallback(() => {
    persistForm();
    onSave();
  }, [onSave, persistForm]);

  const marriedFields = useMemo(
    () => [
      {
        key: 'marriedBrother' as const,
        label: translate('biodataRelationElderBrother'),
        value: form.marriedBrother,
      },
      {
        key: 'marriedYoungerBrother' as const,
        label: translate('biodataRelationYoungerBrother'),
        value: form.marriedYoungerBrother,
      },
      {
        key: 'marriedSister' as const,
        label: translate('biodataRelationElderSister'),
        value: form.marriedSister,
      },
      {
        key: 'marriedYoungerSister' as const,
        label: translate('biodataRelationYoungerSister'),
        value: form.marriedYoungerSister,
      },
    ],
    [form, translate],
  );

  const unmarriedFields = useMemo(
    () => [
      {
        key: 'unmarriedBrother' as const,
        label: translate('biodataRelationElderBrother'),
        value: form.unmarriedBrother,
      },
      {
        key: 'unmarriedYoungerBrother' as const,
        label: translate('biodataRelationYoungerBrother'),
        value: form.unmarriedYoungerBrother,
      },
      {
        key: 'unmarriedSister' as const,
        label: translate('biodataRelationElderSister'),
        value: form.unmarriedSister,
      },
      {
        key: 'unmarriedYoungerSister' as const,
        label: translate('biodataRelationYoungerSister'),
        value: form.unmarriedYoungerSister,
      },
    ],
    [form, translate],
  );

  const biodataSheet = (
    <View style={[styles.sheetOuter, isMobile && styles.sheetOuterMobile]}>
      <View style={[styles.sheetInner, isMobile && styles.sheetInnerMobile]}>
        <View style={[styles.headerRow, isMobile && styles.headerRowMobile]}>
          <View style={[styles.photoBox, isMobile && styles.photoBoxMobile]}>
            <Image
              source={lotusLogo}
              style={styles.lotusLogo}
              resizeMode="contain"
              accessibilityLabel="Lotus logo"
            />
          </View>

          <View style={styles.headerCenter}>
            <View style={[styles.brandRow, isMobile && styles.brandRowMobile]}>
              <Text style={[styles.brandWord, isMobile && styles.brandWordMobile]}>
                {translate('biodataBrandAyya')}
              </Text>
              <Image
                source={lotusLogo}
                style={[styles.brandLotus, isMobile && styles.brandLotusMobile]}
                resizeMode="contain"
                accessibilityLabel="Lotus logo"
              />
              <Text style={[styles.brandWord, isMobile && styles.brandWordMobile]}>
                {translate('biodataBrandThunai')}
              </Text>
            </View>
            <Text
              style={[styles.orgTitle, isMobile && styles.orgTitleMobile]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {translate('biodataOrgTitle')}
            </Text>
            <Text
              style={[styles.orgAddress, isMobile && styles.orgAddressMobile]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {translate('biodataOrgAddressLine1')}
            </Text>
            <Text
              style={[styles.orgAddress, isMobile && styles.orgAddressMobile]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {translate('biodataOrgAddressLine2')}
            </Text>
            <View style={styles.contactRow}>
              <MaterialIcons name="phone" size={12} color="#1B8A3E" />
              <Text style={[styles.contactText, isMobile && styles.contactTextMobile]}>95 43 69 29 00</Text>
              <MaterialIcons name="phone" size={12} color="#1B8A3E" />
              <Text style={[styles.contactText, isMobile && styles.contactTextMobile]}>99 42 81 88 41</Text>
            </View>
          </View>

          <View style={[styles.registrationBox, isMobile && styles.registrationBoxMobile]}>
            <Text style={[styles.registrationLabel, isMobile && styles.registrationLabelMobile]}>
              {translate('biodataRegistrationNumber')}
            </Text>
            <TextInput
              style={[styles.registrationInput, isMobile && styles.registrationInputMobile]}
              value={form.registrationNumber}
              onChangeText={(text) => updateField('registrationNumber', text)}
              editable={editable}
              placeholderTextColor="rgba(139, 0, 0, 0.35)"
            />
          </View>
        </View>

        <View style={[styles.columnsRow, isMobile && styles.columnsRowMobile]}>
          <View style={[styles.leftColumn, isMobile && styles.leftColumnMobile]}>
            <BiodataRow
              label={translate('biodataFieldName')}
              value={form.fullName}
              onChangeText={(text) => updateField('fullName', text)}
              editable={editable}
              mobile={isMobile}
            />
            <BiodataRow
              label={translate('biodataFieldDateOfBirth')}
              value={form.dateOfBirth}
              onChangeText={(text) => updateField('dateOfBirth', text)}
              editable={editable}
              mobile={isMobile}
            />
            <BiodataRow
              label={translate('biodataFieldNatchathiram')}
              value={form.natchathiram}
              onChangeText={(text) => updateField('natchathiram', text)}
              editable={editable}
              mobile={isMobile}
            />
            <BiodataRow
              label={translate('biodataFieldRasi')}
              value={form.rasi}
              onChangeText={(text) => updateField('rasi', text)}
              editable={editable}
              mobile={isMobile}
            />
            <BiodataRow
              label={translate('biodataFieldOccupation')}
              value={form.occupation}
              onChangeText={(text) => updateField('occupation', text)}
              editable={editable}
              mobile={isMobile}
            />
            <BiodataRow
              label={translate('biodataFieldIncome')}
              value={form.monthlyIncome}
              onChangeText={(text) => updateField('monthlyIncome', text)}
              editable={editable}
              mobile={isMobile}
            />
            <BiodataRow
              label={translate('biodataFieldProperty')}
              value={form.propertyDetails}
              onChangeText={(text) => updateField('propertyDetails', text)}
              editable={editable}
              multiline
              mobile={isMobile}
            />
            <BiodataRow
              label={translate('biodataFieldFather')}
              value={form.fatherName}
              onChangeText={(text) => updateField('fatherName', text)}
              editable={editable}
              mobile={isMobile}
            />
            <BiodataRow
              label={translate('biodataFieldMother')}
              value={form.motherName}
              onChangeText={(text) => updateField('motherName', text)}
              editable={editable}
              mobile={isMobile}
            />
            <BiodataRow
              label={translate('biodataFieldResidence')}
              value={form.irupidam}
              onChangeText={(text) => updateField('irupidam', text)}
              editable={editable}
              multiline
              mobile={isMobile}
            />
          </View>

          <View style={[styles.rightColumn, isMobile && styles.rightColumnMobile]}>
            <MetricBox
              label={translate('biodataFieldTotalMembers')}
              value={form.totalFamilyMembers}
              onChangeText={(text) => updateField('totalFamilyMembers', text)}
              editable={editable}
              mobile={isMobile}
            />
            <MetricBox
              label={translate('biodataFieldBirthOrder')}
              value={form.birthOrder}
              onChangeText={(text) => updateField('birthOrder', text)}
              editable={editable}
              mobile={isMobile}
            />
            <MemberBox
              title={translate('biodataSectionMarried')}
              fields={marriedFields}
              editable={editable}
              onChange={updateField}
              mobile={isMobile}
            />
            <MemberBox
              title={translate('biodataSectionUnmarried')}
              fields={unmarriedFields}
              editable={editable}
              onChange={updateField}
              mobile={isMobile}
            />
            <MetricBox
              label={translate('biodataFieldComplexion')}
              value={form.complexion}
              onChangeText={(text) => updateField('complexion', text)}
              editable={editable}
              mobile={isMobile}
            />
            <MetricBox
              label={translate('biodataFieldHeight')}
              value={form.height}
              onChangeText={(text) => updateField('height', text)}
              editable={editable}
              mobile={isMobile}
            />
            <MetricBox
              label={translate('biodataFieldSeervarisai')}
              value={form.seervarisai}
              onChangeText={(text) => updateField('seervarisai', text)}
              editable={editable}
              mobile={isMobile}
            />
          </View>
        </View>

        <View style={styles.chartsRow}>
          <HoroscopeChart
            centerLabel={translate('biodataChartRasi')}
            cells={rasiChart}
            editable={editable}
            mobile={isMobile}
            onCellChange={(row, col, value) => {
              setRasiChart((current) =>
                current.map((cells, rowIndex) =>
                  cells.map((cell, colIndex) =>
                    rowIndex === row && colIndex === col ? value : cell,
                  ),
                ),
              );
            }}
          />
          <HoroscopeChart
            centerLabel={translate('biodataChartAmsam')}
            cells={amsamChart}
            editable={editable}
            mobile={isMobile}
            onCellChange={(row, col, value) => {
              setAmsamChart((current) =>
                current.map((cells, rowIndex) =>
                  cells.map((cell, colIndex) =>
                    rowIndex === row && colIndex === col ? value : cell,
                  ),
                ),
              );
            }}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.dasaRow, isMobile && styles.dasaRowMobile]}
        >
          <Text
            style={[styles.dasaLabel, isMobile && styles.dasaLabelMobile]}
            numberOfLines={1}
          >
            {translate('biodataDasaBalance')}
          </Text>
          <TextInput
            style={[styles.dasaInput, isMobile && styles.dasaInputMobile]}
            value={form.dasaBalance}
            onChangeText={(text) => updateField('dasaBalance', text)}
            editable={editable}
          />
          <Text
            style={[styles.dasaLabel, isMobile && styles.dasaLabelMobile]}
            numberOfLines={1}
          >
            {translate('biodataYear')}
          </Text>
          <TextInput
            style={[styles.dasaInputSmall, isMobile && styles.dasaInputSmallMobile]}
            value={form.dasaYear}
            onChangeText={(text) => updateField('dasaYear', text)}
            editable={editable}
          />
          <Text
            style={[styles.dasaLabel, isMobile && styles.dasaLabelMobile]}
            numberOfLines={1}
          >
            {translate('biodataMonth')}
          </Text>
          <TextInput
            style={[styles.dasaInputSmall, isMobile && styles.dasaInputSmallMobile]}
            value={form.dasaMonth}
            onChangeText={(text) => updateField('dasaMonth', text)}
            editable={editable}
          />
          <Text
            style={[styles.dasaLabel, isMobile && styles.dasaLabelMobile]}
            numberOfLines={1}
          >
            {translate('biodataDay')}
          </Text>
          <TextInput
            style={[styles.dasaInputSmall, isMobile && styles.dasaInputSmallMobile]}
            value={form.dasaDay}
            onChangeText={(text) => updateField('dasaDay', text)}
            editable={editable}
          />
        </ScrollView>

        <View style={styles.detailGrid}>
          {Array.from({ length: DETAIL_GRID_ROWS }, (_, rowIndex) => (
            <View key={rowIndex} style={styles.detailGridRow}>
              {detailGrid
                .slice(rowIndex * DETAIL_GRID_COLUMNS, rowIndex * DETAIL_GRID_COLUMNS + DETAIL_GRID_COLUMNS)
                .map((cell, colIndex) => {
                  const index = rowIndex * DETAIL_GRID_COLUMNS + colIndex;
                  return (
                    <View
                      key={index}
                      style={[styles.detailCellWrap, isMobile && styles.detailCellWrapMobile]}
                    >
                      <TextInput
                        style={[styles.detailCellInput, isMobile && styles.detailCellInputMobile]}
                        value={cell}
                        onChangeText={(text) => {
                          setDetailGrid((current) =>
                            current.map((value, cellIndex) => (cellIndex === index ? text : value)),
                          );
                        }}
                        editable={editable}
                        textAlign="center"
                      />
                    </View>
                  );
                })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <ScrollView
        showsVerticalScrollIndicator
        nestedScrollEnabled
        contentContainerStyle={[styles.scrollContent, isMobile && styles.scrollContentMobile]}
      >
        {biodataSheet}
      </ScrollView>

      <View style={[styles.actionBar, isMobile && styles.actionBarMobile]}>
        <Pressable
          style={[styles.actionButtonOutline, isMobile && styles.actionButtonOutlineMobile]}
          onPress={onDownloadPdf}
        >
          <MaterialIcons name="picture-as-pdf" size={isMobile ? 16 : 18} color={SHEET_RED} />
          <Text
            style={[styles.actionButtonOutlineText, isMobile && styles.actionButtonOutlineTextMobile]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {translate('downloadPdf')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.actionButtonOutline, isMobile && styles.actionButtonOutlineMobile]}
          onPress={onEditProfile}
        >
          <MaterialIcons name="edit" size={isMobile ? 16 : 18} color={SHEET_RED} />
          <Text
            style={[styles.actionButtonOutlineText, isMobile && styles.actionButtonOutlineTextMobile]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {translate('editProfile')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.actionButtonPrimary, isMobile && styles.actionButtonPrimaryMobile]}
          onPress={handleSavePress}
        >
          <MaterialIcons name="save" size={isMobile ? 16 : 18} color="#fff" />
          <Text
            style={[styles.actionButtonPrimaryText, isMobile && styles.actionButtonPrimaryTextMobile]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {translate('saveAndContinue')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    alignItems: 'center',
  },
  scrollContentMobile: {
    paddingHorizontal: 8,
  },
  sheetOuter: {
    width: '100%',
    maxWidth: 820,
    borderWidth: 3,
    borderColor: SHEET_BORDER,
    backgroundColor: '#fff',
    padding: 4,
  },
  sheetOuterMobile: {
    padding: 2,
  },
  sheetInner: {
    borderWidth: 2,
    borderColor: SHEET_RED,
    backgroundColor: '#fff',
    padding: 12,
  },
  sheetInnerMobile: {
    padding: 6,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 10,
    borderBottomWidth: 2,
    borderBottomColor: SHEET_RED,
    paddingBottom: 12,
    marginBottom: 12,
  },
  headerRowMobile: {
    gap: 6,
    paddingBottom: 8,
    marginBottom: 8,
  },
  photoBox: {
    width: 92,
    height: 112,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  photoBoxMobile: {
    width: 68,
    height: 82,
  },
  lotusLogo: {
    width: '100%',
    height: '100%',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 0,
    width: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  brandRowMobile: {
    gap: 5,
  },
  brandWord: {
    color: SHEET_RED,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  brandWordMobile: {
    fontSize: 14,
  },
  brandLotus: {
    width: 38,
    height: 38,
  },
  brandLotusMobile: {
    width: 28,
    height: 28,
  },
  orgTitle: {
    color: SHEET_RED,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  orgTitleMobile: {
    fontSize: 10,
  },
  orgAddress: {
    color: SHEET_RED,
    fontSize: 10,
    textAlign: 'center',
    width: '100%',
  },
  orgAddressMobile: {
    fontSize: 8,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  contactText: {
    color: '#1B8A3E',
    fontSize: 11,
    fontWeight: '600',
    marginRight: 8,
  },
  contactTextMobile: {
    fontSize: 9,
    marginRight: 4,
  },
  registrationBox: {
    width: 72,
    borderWidth: 2,
    borderColor: SHEET_RED,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registrationBoxMobile: {
    width: 56,
    padding: 4,
  },
  registrationLabel: {
    color: SHEET_RED,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  registrationLabelMobile: {
    fontSize: 8,
    marginBottom: 2,
  },
  registrationInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: SHEET_RED,
    minHeight: 28,
    textAlign: 'center',
    color: '#111',
    fontSize: 14,
    fontWeight: '700',
  },
  registrationInputMobile: {
    minHeight: 22,
    fontSize: 11,
  },
  columnsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  columnsRowMobile: {
    gap: 6,
  },
  leftColumn: {
    flex: 1.2,
    minWidth: 0,
    borderWidth: 1,
    borderColor: SHEET_RED,
    padding: 8,
    gap: 6,
  },
  leftColumnMobile: {
    padding: 4,
    gap: 4,
  },
  rightColumn: {
    flex: 0.9,
    minWidth: 0,
    gap: 8,
  },
  rightColumnMobile: {
    gap: 4,
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(176, 0, 0, 0.25)',
    paddingBottom: 4,
  },
  rowLabel: {
    color: SHEET_RED,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  rowLabelMobile: {
    fontSize: 9,
    marginBottom: 1,
  },
  rowInput: {
    minHeight: 28,
    borderWidth: 1,
    borderColor: 'rgba(176, 0, 0, 0.35)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    color: '#111',
    fontSize: 13,
    backgroundColor: '#fff',
  },
  rowInputMobile: {
    minHeight: 22,
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontSize: 11,
  },
  rowInputMultiline: {
    minHeight: 48,
    textAlignVertical: 'top',
  },
  rowInputMultilineMobile: {
    minHeight: 36,
  },
  metricBox: {
    borderWidth: 1,
    borderColor: SHEET_RED,
    padding: 6,
  },
  metricBoxMobile: {
    padding: 4,
  },
  metricLabel: {
    color: SHEET_RED,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabelMobile: {
    fontSize: 8,
    marginBottom: 2,
  },
  metricInput: {
    borderWidth: 1,
    borderColor: 'rgba(176, 0, 0, 0.35)',
    minHeight: 28,
    paddingHorizontal: 6,
    color: '#111',
    fontSize: 13,
    backgroundColor: '#fff',
  },
  metricInputMobile: {
    minHeight: 22,
    paddingHorizontal: 4,
    fontSize: 11,
  },
  memberBox: {
    borderWidth: 1,
    borderColor: SHEET_RED,
    padding: 6,
    gap: 4,
  },
  memberBoxMobile: {
    padding: 4,
    gap: 2,
  },
  memberTitle: {
    color: SHEET_RED,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  memberTitleMobile: {
    fontSize: 8,
    marginBottom: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberLabel: {
    width: 62,
    flexShrink: 0,
    color: SHEET_RED,
    fontSize: 10,
    fontWeight: '700',
  },
  memberLabelMobile: {
    width: 64,
    fontSize: 9,
  },
  memberInput: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: 'rgba(176, 0, 0, 0.35)',
    minHeight: 22,
    paddingHorizontal: 3,
    color: '#111',
    fontSize: 11,
    backgroundColor: '#fff',
  },
  memberInputMobile: {
    minHeight: 20,
    fontSize: 10,
    paddingHorizontal: 2,
  },
  chartsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  chartWrap: {
    flex: 1,
    minWidth: 150,
    maxWidth: 220,
    borderWidth: 1,
    borderColor: SHEET_RED,
    padding: 4,
    backgroundColor: '#fff',
  },
  chartGrid: {
    width: '100%',
    aspectRatio: 1,
    flexDirection: 'column',
    backgroundColor: SHEET_RED,
    gap: 1,
    padding: 1,
  },
  chartGridMobile: {
    aspectRatio: 1,
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
  chartCellWrapMobile: {},
  chartCellInput: {
    width: '100%',
    flex: 1,
    fontSize: 10,
    color: '#111',
    padding: 2,
    backgroundColor: 'transparent',
  },
  chartCellInputMobile: {
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
  chartCenterMobile: {
    paddingHorizontal: 2,
    paddingVertical: 4,
    gap: 2,
  },
  chartCenterLabel: {
    color: SHEET_RED,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  chartCenterLabelMobile: {
    fontSize: 10,
  },
  dasaRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: SHEET_RED,
    paddingTop: 10,
    paddingBottom: 2,
  },
  dasaRowMobile: {
    marginTop: 8,
    gap: 3,
    paddingTop: 6,
  },
  dasaLabel: {
    color: SHEET_RED,
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 0,
  },
  dasaLabelMobile: {
    fontSize: 8,
  },
  dasaInput: {
    width: 72,
    borderWidth: 1,
    borderColor: SHEET_RED,
    minHeight: 26,
    paddingHorizontal: 4,
    color: '#111',
    fontSize: 11,
    flexShrink: 0,
  },
  dasaInputMobile: {
    width: 52,
    minHeight: 20,
    fontSize: 9,
    paddingHorizontal: 2,
  },
  dasaInputSmall: {
    width: 36,
    borderWidth: 1,
    borderColor: SHEET_RED,
    minHeight: 26,
    paddingHorizontal: 2,
    textAlign: 'center',
    color: '#111',
    fontSize: 11,
    flexShrink: 0,
  },
  dasaInputSmallMobile: {
    width: 28,
    minHeight: 20,
    fontSize: 9,
  },
  detailGrid: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: SHEET_RED,
  },
  detailGridRow: {
    flexDirection: 'row',
  },
  detailCellWrap: {
    flex: 1,
    borderWidth: 1,
    borderColor: SHEET_RED,
    alignItems: 'center',
    paddingVertical: 2,
    minWidth: 0,
  },
  detailCellWrapMobile: {
    paddingVertical: 1,
  },
  detailCellInput: {
    width: '100%',
    minHeight: 20,
    fontSize: 8,
    color: '#111',
    paddingHorizontal: 0,
  },
  detailCellInputMobile: {
    minHeight: 16,
    fontSize: 7,
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(176, 0, 0, 0.2)',
  },
  actionBarMobile: {
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: SHEET_RED,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    minWidth: 0,
  },
  actionButtonOutlineMobile: {
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  actionButtonOutlineText: {
    color: SHEET_RED,
    fontWeight: '700',
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
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: SHEET_RED,
    minWidth: 0,
  },
  actionButtonPrimaryMobile: {
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  actionButtonPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    flexShrink: 1,
  },
  actionButtonPrimaryTextMobile: {
    fontSize: 10,
  },
});
