import { Language } from '@/constants/i18n';

export type FormOption = {
  value: string;
  label: Record<Language, string>;
};

export type FormOptionsKey =
  | 'gender'
  | 'education'
  | 'religion'
  | 'community'
  | 'occupation'
  | 'monthlyIncome'
  | 'height'
  | 'rasi'
  | 'nakshatra'
  | 'familyType'
  | 'familyValues'
  | 'ageRange'
  | 'preferredLocation'
  | 'siblingCount'
  | 'countryCode'
  | 'educationPreference'
  | 'anyOption';

function opt(value: string, en: string, ta: string): FormOption {
  return { value, label: { en, ta } };
}

export const formOptionLists: Record<FormOptionsKey, FormOption[]> = {
  gender: [
    opt('male', 'Male', 'ஆண்'),
    opt('female', 'Female', 'பெண்'),
  ],
  education: [
    opt('high-school', 'High School', 'உயர்நிலை பள்ளி'),
    opt('diploma', 'Diploma', 'டிப்ளோமா'),
    opt('bachelors', "Bachelor's Degree", 'இளங்கலை பட்டம்'),
    opt('masters', "Master's Degree", 'முதுகலை பட்டம்'),
    opt('doctorate', 'Doctorate / PhD', 'முனைவர் பட்டம்'),
    opt('other', 'Other Professional Qualification', 'பிற தொழில்முறை தகுதி'),
  ],
  religion: [
    opt('hindu', 'Hindu', 'இந்து'),
    opt('christian', 'Christian', 'கிறிஸ்தவர்'),
    opt('muslim', 'Muslim', 'முஸ்லிம்'),
    opt('sikh', 'Sikh', 'சீக்கியர்'),
    opt('jain', 'Jain', 'ஜைனர்'),
    opt('buddhist', 'Buddhist', 'பௌத்தர்'),
  ],
  community: [
    opt('adi-dravidar', 'Adi Dravidar', 'ஆதி திராவிடர்'),
    opt('brahmin', 'Brahmin', 'பிராமணர்'),
    opt('chettiar', 'Chettiar', 'செட்டியார்'),
    opt('gounder', 'Gounder', 'கவுண்டர்'),
    opt('iyer', 'Iyer', 'ஐயங்கார்'),
    opt('nadar', 'Nadar', 'நாடார்'),
    opt('pillai', 'Pillai', 'பிள்ளை'),
    opt('thevar', 'Thevar', 'தேவர்'),
    opt('vanniyar', 'Vanniyar', 'வன்னியர்'),
    opt('intercaste', 'Caste No Bar / Intercaste', 'சாதி இல்லை / இடைசாதி'),
    opt('any', 'Any', 'எதுவும்'),
  ],
  educationPreference: [
    opt('any', 'Any', 'எதுவும்'),
    opt('high-school', 'High School', 'உயர்நிலை பள்ளி'),
    opt('diploma', 'Diploma', 'டிப்ளோமா'),
    opt('bachelors', "Bachelor's Degree", 'இளங்கலை பட்டம்'),
    opt('masters', "Master's Degree", 'முதுகலை பட்டம்'),
    opt('doctorate', 'Doctorate / PhD', 'முனைவர் பட்டம்'),
    opt('other', 'Other Professional Qualification', 'பிற தொழில்முறை தகுதி'),
  ],
  occupation: [
    opt('software', 'Software Professional', 'மென்பொருள் தொழில்முறை'),
    opt('engineer', 'Engineer (Non-IT)', 'பொறியாளர் (ஐடி அல்லாத)'),
    opt('doctor', 'Healthcare / Doctor', 'சுகாதாரம் / மருத்துவர்'),
    opt('teacher', 'Education / Teacher', 'கல்வி / ஆசிரியர்'),
    opt('business', 'Business / Entrepreneur', 'வணிகம் / தொழில்முனைவோர்'),
    opt('government', 'Government / Civil Services', 'அரசு / குடிமைப் பணி'),
    opt('creative', 'Creative / Arts / Media', 'கலை / ஊடகம்'),
    opt('banking', 'Banking / Finance', 'வங்கி / நிதி'),
    opt('student', 'Student', 'மாணவர்'),
    opt('homemaker', 'Homemaker', 'இல்லத்தரசி'),
    opt('other', 'Others', 'பிற'),
  ],
  monthlyIncome: [
    opt('below-25k', 'Below ₹25,000', '₹25,000 க்கு கீழ்'),
    opt('25k-40k', '₹25,000 - ₹40,000', '₹25,000 - ₹40,000'),
    opt('40k-60k', '₹40,000 - ₹60,000', '₹40,000 - ₹60,000'),
    opt('60k-1l', '₹60,000 - ₹1,00,000', '₹60,000 - ₹1,00,000'),
    opt('1l-2l', '₹1,00,000 - ₹2,00,000', '₹1,00,000 - ₹2,00,000'),
    opt('above-2l', 'Above ₹2,00,000', '₹2,00,000 க்கு மேல்'),
    opt('not-specified', 'Prefer not to say', 'சொல்ல விரும்பவில்லை'),
  ],
  height: [
    opt('152', '5\' 0" (152 cm)', '5\' 0" (152 செ.மீ)'),
    opt('155', '5\' 1" (155 cm)', '5\' 1" (155 செ.மீ)'),
    opt('157', '5\' 2" (157 cm)', '5\' 2" (157 செ.மீ)'),
    opt('160', '5\' 3" (160 cm)', '5\' 3" (160 செ.மீ)'),
    opt('163', '5\' 4" (163 cm)', '5\' 4" (163 செ.மீ)'),
    opt('165', '5\' 5" (165 cm)', '5\' 5" (165 செ.மீ)'),
    opt('168', '5\' 6" (168 cm)', '5\' 6" (168 செ.மீ)'),
    opt('170', '5\' 7" (170 cm)', '5\' 7" (170 செ.மீ)'),
    opt('173', '5\' 8" (173 cm)', '5\' 8" (173 செ.மீ)'),
    opt('175', '5\' 9" (175 cm)', '5\' 9" (175 செ.மீ)'),
    opt('178', '5\' 10" (178 cm)', '5\' 10" (178 செ.மீ)'),
    opt('180', '5\' 11" (180 cm)', '5\' 11" (180 செ.மீ)'),
    opt('183', '6\' 0" (183 cm)', '6\' 0" (183 செ.மீ)'),
  ],
  rasi: [
    opt('mesham', 'Mesham (Aries)', 'மேஷம்'),
    opt('rishabam', 'Rishabam (Taurus)', 'ரிஷபம்'),
    opt('mithunam', 'Mithunam (Gemini)', 'மிதுனம்'),
    opt('kadagam', 'Kadagam (Cancer)', 'கடகம்'),
    opt('simham', 'Simham (Leo)', 'சிம்மம்'),
    opt('kanni', 'Kanni (Virgo)', 'கன்னி'),
    opt('thulam', 'Thulam (Libra)', 'துலாம்'),
    opt('vrischikam', 'Vrischikam (Scorpio)', 'விருச்சிகம்'),
    opt('dhanusu', 'Dhanusu (Sagittarius)', 'தனுசு'),
    opt('makaram', 'Makaram (Capricorn)', 'மகரம்'),
    opt('kumbam', 'Kumbam (Aquarius)', 'கும்பம்'),
    opt('meenam', 'Meenam (Pisces)', 'மீனம்'),
  ],
  nakshatra: [
    opt('ashwini', 'Ashwini', 'அசுவினி'),
    opt('bharani', 'Bharani', 'பரணி'),
    opt('krittika', 'Krittika', 'கிருத்திகை'),
    opt('rohini', 'Rohini', 'ரோகிணி'),
    opt('mrigashira', 'Mrigashira', 'மிருகசீரிஷம்'),
    opt('ardra', 'Ardra', 'திருவாதிரை'),
    opt('punarvasu', 'Punarvasu', 'புனர்பூசம்'),
    opt('pushya', 'Pushya', 'ஆயில்யம்'),
    opt('ashlesha', 'Ashlesha', 'மகம்'),
    opt('magha', 'Magha', 'பூரம்'),
    opt('purva-phalguni', 'Purva Phalguni', 'உத்திரம்'),
    opt('uttara-phalguni', 'Uttara Phalguni', 'ஹஸ்தம்'),
    opt('hasta', 'Hasta', 'சித்திரை'),
    opt('chitra', 'Chitra', 'சுவாதி'),
    opt('swati', 'Swati', 'விசாகம்'),
    opt('vishakha', 'Vishakha', 'அனுஷம்'),
    opt('anuradha', 'Anuradha', 'கேட்டை'),
    opt('jyeshtha', 'Jyeshtha', 'மூலம்'),
    opt('mula', 'Mula', 'பூராடம்'),
    opt('purva-ashadha', 'Purva Ashadha', 'உத்திராடம்'),
    opt('uttara-ashadha', 'Uttara Ashadha', 'திருவோணம்'),
    opt('shravana', 'Shravana', 'அவிட்டம்'),
    opt('dhanishta', 'Dhanishta', 'சதயம்'),
    opt('shatabhisha', 'Shatabhisha', 'பூரட்டாதி'),
    opt('purva-bhadrapada', 'Purva Bhadrapada', 'உத்திரட்டாதி'),
    opt('uttara-bhadrapada', 'Uttara Bhadrapada', 'உத்திரட்டாதி'),
    opt('revati', 'Revati', 'ரேவதி'),
  ],
  familyType: [
    opt('joint', 'Joint Family', 'கூட்டு குடும்பம்'),
    opt('nuclear', 'Nuclear Family', 'தனி குடும்பம்'),
  ],
  familyValues: [
    opt('traditional', 'Traditional', 'பாரம்பரிய'),
    opt('moderate', 'Moderate', 'மிதமான'),
    opt('liberal', 'Liberal', 'தாராள'),
  ],
  ageRange: [
    opt('21-25', '21 - 25', '21 - 25'),
    opt('25-30', '25 - 30', '25 - 30'),
    opt('25-32', '25 - 32', '25 - 32'),
    opt('30-35', '30 - 35', '30 - 35'),
    opt('35-40', '35 - 40', '35 - 40'),
  ],
  preferredLocation: [
    opt('tamil-nadu', 'Tamil Nadu', 'தமிழ்நாடு'),
    opt('chennai', 'Chennai', 'சென்னை'),
    opt('coimbatore', 'Coimbatore', 'கோயம்புத்தூர்'),
    opt('madurai', 'Madurai', 'மதுரை'),
    opt('bangalore', 'Bangalore', 'பெங்களூர்'),
    opt('abroad', 'Abroad', 'வெளிநாடு'),
    opt('any', 'Any', 'எதுவும்'),
  ],
  siblingCount: [
    opt('0', 'None', 'இல்லை'),
    opt('1', '1', '1'),
    opt('2', '2', '2'),
    opt('3', '3', '3'),
    opt('4', '4', '4'),
    opt('5+', '5 or more', '5 அல்லது அதற்கு மேல்'),
  ],
  countryCode: [
    opt('+91', 'India (+91)', 'இந்தியா (+91)'),
    opt('+1', 'USA (+1)', 'அமெரிக்கா (+1)'),
    opt('+44', 'UK (+44)', 'இங்கிலாந்து (+44)'),
    opt('+971', 'UAE (+971)', 'ஐக்கிய அரபு எமிரேட்ஸ் (+971)'),
  ],
  anyOption: [
    opt('any', 'Any', 'எதுவும்'),
  ],
};

export function getFormOptions(key: FormOptionsKey, language: Language) {
  return formOptionLists[key].map((option) => ({
    value: option.value,
    label: option.label[language],
  }));
}

export function getOptionLabel(
  key: FormOptionsKey,
  value: string | undefined,
  language: Language,
  fallback = '',
) {
  if (!value) {
    return fallback;
  }
  const match = formOptionLists[key].find((option) => option.value === value);
  return match?.label[language] ?? value;
}

export type ProfileFieldConfig = {
  fieldKey: string;
  kind: 'text' | 'select' | 'date';
  optionsKey?: FormOptionsKey;
  multiline?: boolean;
};

export const profileStepFieldConfig: Record<string, ProfileFieldConfig[]> = {
  '2': [
    { fieldKey: 'fullName', kind: 'text' },
    { fieldKey: 'gender', kind: 'select', optionsKey: 'gender' },
  ],
  '3': [{ fieldKey: 'dateOfBirth', kind: 'date' }],
  '5': [{ fieldKey: 'rasi', kind: 'select', optionsKey: 'rasi' }],
  '6': [{ fieldKey: 'nakshatra', kind: 'select', optionsKey: 'nakshatra' }],
  '7': [{ fieldKey: 'education', kind: 'select', optionsKey: 'education' }],
  '8': [{ fieldKey: 'occupation', kind: 'select', optionsKey: 'occupation' }],
  '9': [{ fieldKey: 'monthlyIncome', kind: 'select', optionsKey: 'monthlyIncome' }],
  '10': [{ fieldKey: 'nativePlace', kind: 'text' }],
  '11': [
    { fieldKey: 'fatherName', kind: 'text' },
    { fieldKey: 'fatherOccupation', kind: 'select', optionsKey: 'occupation' },
  ],
  '12': [
    { fieldKey: 'motherName', kind: 'text' },
    { fieldKey: 'motherOccupation', kind: 'select', optionsKey: 'occupation' },
  ],
  '13': [
    { fieldKey: 'brothers', kind: 'select', optionsKey: 'siblingCount' },
    { fieldKey: 'sisters', kind: 'select', optionsKey: 'siblingCount' },
  ],
  '15': [
    { fieldKey: 'familyType', kind: 'select', optionsKey: 'familyType' },
    { fieldKey: 'familyValues', kind: 'select', optionsKey: 'familyValues' },
  ],
  '16': [{ fieldKey: 'propertyDetails', kind: 'text', multiline: true }],
  '17': [{ fieldKey: 'height', kind: 'select', optionsKey: 'height' }],
};

export const profileOptionStepKeys: Record<string, string> = {
  '1': 'profileFor',
  '4': 'maritalStatus',
  '14': 'birthOrder',
  final: 'photoAction',
};
