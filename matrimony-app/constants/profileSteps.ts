import { MaterialIcons } from '@expo/vector-icons';
import { Language } from '@/constants/i18n';

export type ProfileStep = {
  id: string;
  step: number;
  total: number;
  title: string;
  subtitle: string;
  options?: { label: string; icon: keyof typeof MaterialIcons.glyphMap; wide?: boolean }[];
  fields?: { label: string; placeholder: string; type?: 'text' | 'select' }[];
};

type StepContent = {
  title: string;
  subtitle: string;
  options?: { key: string; icon: keyof typeof MaterialIcons.glyphMap; wide?: boolean }[];
  fields?: { label: string; placeholder: string; type?: 'text' | 'select' }[];
};

const stepContent: Record<Language, Record<string, StepContent>> = {
  en: {
    '1': {
      title: 'Who are you creating this profile for?',
      subtitle: 'Select the relationship that best describes your bond with the person seeking a match.',
      options: [
        { key: 'Myself', icon: 'person' },
        { key: 'Son', icon: 'face' },
        { key: 'Daughter', icon: 'face' },
        { key: 'Brother', icon: 'boy' },
        { key: 'Sister', icon: 'girl' },
        { key: 'Relative', icon: 'groups' },
        { key: 'Friend', icon: 'people', wide: true },
      ],
    },
    '2': {
      title: 'Name',
      subtitle: 'Enter the full name as it should appear on the matrimony profile.',
      fields: [
        { label: 'Full Name', placeholder: 'Enter full name' },
        { label: 'Gender', placeholder: 'Select gender', type: 'select' },
      ],
    },
    '3': {
      title: 'Date of Birth',
      subtitle: 'Your date of birth helps us show accurate age details to prospective families.',
      fields: [{ label: 'Date of Birth', placeholder: 'DD / MM / YYYY' }],
    },
    '4': {
      title: 'Marital Status',
      subtitle: 'Select the current marital status of the person seeking a match.',
      options: [
        { key: 'Never Married', icon: 'favorite' },
        { key: 'Widowed', icon: 'heart_broken' },
        { key: 'Divorced', icon: 'splitscreen' },
        { key: 'Awaiting Divorce', icon: 'hourglass_empty' },
      ],
    },
    '5': {
      title: 'Rasi',
      subtitle: 'Select the rasi for horoscope compatibility matching.',
      fields: [{ label: 'Rasi', placeholder: 'Select rasi', type: 'select' }],
    },
    '6': {
      title: 'Nakshatra',
      subtitle: 'Select the nakshatra for traditional horoscope matching.',
      fields: [{ label: 'Nakshatra', placeholder: 'Select nakshatra', type: 'select' }],
    },
    '7': {
      title: 'Education',
      subtitle: 'Share the highest educational qualification.',
      fields: [{ label: 'Education', placeholder: 'Select education', type: 'select' }],
    },
    '8': {
      title: 'Occupation',
      subtitle: 'Share the current profession or occupation.',
      fields: [{ label: 'Occupation', placeholder: 'Enter occupation' }],
    },
    '9': {
      title: 'Monthly Income',
      subtitle: 'Select the approximate monthly income range.',
      fields: [{ label: 'Monthly Income', placeholder: 'Select range', type: 'select' }],
    },
    '10': {
      title: 'Native Place',
      subtitle: 'Enter the native place or hometown of the family.',
      fields: [{ label: 'Native Place', placeholder: 'e.g. Madurai, Tamil Nadu' }],
    },
    '11': {
      title: 'Father Details',
      subtitle: 'Share basic details about the father.',
      fields: [
        { label: "Father's Name", placeholder: 'Enter name' },
        { label: "Father's Occupation", placeholder: 'Enter occupation' },
      ],
    },
    '12': {
      title: 'Mother Details',
      subtitle: 'Share basic details about the mother.',
      fields: [
        { label: "Mother's Name", placeholder: 'Enter name' },
        { label: "Mother's Occupation", placeholder: 'Enter occupation' },
      ],
    },
    '13': {
      title: 'Siblings Details',
      subtitle: 'Share details about brothers and sisters in the family.',
      fields: [
        { label: 'Brothers', placeholder: 'e.g. 1 (Married)' },
        { label: 'Sisters', placeholder: 'e.g. 1 (Unmarried)' },
      ],
    },
    '14': {
      title: 'Birth Order',
      subtitle: 'Select the birth order among siblings.',
      options: [
        { key: 'Eldest', icon: 'looks_one' },
        { key: 'Middle', icon: 'looks_two' },
        { key: 'Youngest', icon: 'looks_3' },
        { key: 'Only Child', icon: 'person' },
      ],
    },
    '15': {
      title: 'Family Details',
      subtitle: 'Share family background information.',
      fields: [
        { label: 'Family Type', placeholder: 'Joint / Nuclear', type: 'select' },
        { label: 'Family Values', placeholder: 'Traditional / Moderate / Liberal', type: 'select' },
      ],
    },
    '16': {
      title: 'Property Details',
      subtitle: 'Share details about family property, if any.',
      fields: [{ label: 'Property Details', placeholder: 'e.g. Own house, agricultural land' }],
    },
    '17': {
      title: 'Height',
      subtitle: 'Select the height of the person seeking a match.',
      fields: [{ label: 'Height', placeholder: 'Select height', type: 'select' }],
    },
    final: {
      title: 'Upload Photos',
      subtitle: 'Add at least one clear photo to complete your profile.',
      options: [
        { key: 'Add Photo', icon: 'add-a-photo' },
        { key: 'Skip for Now', icon: 'skip-next' },
      ],
    },
  },
  ta: {
    '1': {
      title: 'இந்த சுயவிவரத்தை யாருக்காக உருவாக்குகிறீர்கள்?',
      subtitle: 'வரன்/வதுவை தேடுபவருடன் உங்கள் உறவைத் தேர்ந்தெடுக்கவும்.',
      options: [
        { key: 'எனக்கே', icon: 'person' },
        { key: 'மகன்', icon: 'face' },
        { key: 'மகள்', icon: 'face' },
        { key: 'சகோதரன்', icon: 'boy' },
        { key: 'சகோதரி', icon: 'girl' },
        { key: 'உறவினர்', icon: 'groups' },
        { key: 'நண்பர்', icon: 'people', wide: true },
      ],
    },
    '2': {
      title: 'பெயர்',
      subtitle: 'திருமண சுயவிவரத்தில் காட்ட வேண்டிய முழு பெயரை உள்ளிடவும்.',
      fields: [
        { label: 'முழு பெயர்', placeholder: 'முழு பெயரை உள்ளிடவும்' },
        { label: 'பாலினம்', placeholder: 'பாலினத்தைத் தேர்ந்தெடுக்கவும்', type: 'select' },
      ],
    },
    '3': {
      title: 'பிறந்த தேதி',
      subtitle: 'சரியான வயது விவரங்களைக் காட்ட உதவும்.',
      fields: [{ label: 'பிறந்த தேதி', placeholder: 'நாள் / மாதம் / ஆண்டு' }],
    },
    '4': {
      title: 'திருமண நிலை',
      subtitle: 'தற்போதைய திருமண நிலையைத் தேர்ந்தெடுக்கவும்.',
      options: [
        { key: 'திருமணமாகாதவர்', icon: 'favorite' },
        { key: 'விதவை/விதவர்', icon: 'heart_broken' },
        { key: 'விவாகரத்து பெற்றவர்', icon: 'splitscreen' },
        { key: 'விவாகரத்துக்காக காத்திருப்பவர்', icon: 'hourglass_empty' },
      ],
    },
    '5': {
      title: 'ராசி',
      subtitle: 'ஜாதக பொருத்தத்திற்கு ராசியைத் தேர்ந்தெடுக்கவும்.',
      fields: [{ label: 'ராசி', placeholder: 'ராசியைத் தேர்ந்தெடுக்கவும்', type: 'select' }],
    },
    '6': {
      title: 'நட்சத்திரம்',
      subtitle: 'பாரம்பரிய ஜாதக பொருத்தத்திற்கு நட்சத்திரத்தைத் தேர்ந்தெடுக்கவும்.',
      fields: [{ label: 'நட்சத்திரம்', placeholder: 'நட்சத்திரத்தைத் தேர்ந்தெடுக்கவும்', type: 'select' }],
    },
    '7': {
      title: 'கல்வி',
      subtitle: 'உயர்ந்த கல்வித் தகுதியைப் பகிரவும்.',
      fields: [{ label: 'கல்வி', placeholder: 'கல்வியைத் தேர்ந்தெடுக்கவும்', type: 'select' }],
    },
    '8': {
      title: 'தொழில்',
      subtitle: 'தற்போதைய தொழில் அல்லது வேலையைப் பகிரவும்.',
      fields: [{ label: 'தொழில்', placeholder: 'தொழிலை உள்ளிடவும்' }],
    },
    '9': {
      title: 'மாத வருமானம்',
      subtitle: 'தோராயமான மாத வருமான வரம்பைத் தேர்ந்தெடுக்கவும்.',
      fields: [{ label: 'மாத வருமானம்', placeholder: 'வரம்பைத் தேர்ந்தெடுக்கவும்', type: 'select' }],
    },
    '10': {
      title: 'சொந்த ஊர்',
      subtitle: 'குடும்பத்தின் சொந்த ஊர் அல்லது பிறப்பிடத்தை உள்ளிடவும்.',
      fields: [{ label: 'சொந்த ஊர்', placeholder: 'எ.கா. மதுரை, தமிழ்நாடு' }],
    },
    '11': {
      title: 'தந்தை விவரங்கள்',
      subtitle: 'தந்தையைப் பற்றிய அடிப்படை விவரங்களைப் பகிரவும்.',
      fields: [
        { label: 'தந்தையின் பெயர்', placeholder: 'பெயரை உள்ளிடவும்' },
        { label: 'தந்தையின் தொழில்', placeholder: 'தொழிலை உள்ளிடவும்' },
      ],
    },
    '12': {
      title: 'தாய் விவரங்கள்',
      subtitle: 'தாயைப் பற்றிய அடிப்படை விவரங்களைப் பகிரவும்.',
      fields: [
        { label: 'தாயின் பெயர்', placeholder: 'பெயரை உள்ளிடவும்' },
        { label: 'தாயின் தொழில்', placeholder: 'தொழிலை உள்ளிடவும்' },
      ],
    },
    '13': {
      title: 'சகோதரர்/சகோதரி விவரங்கள்',
      subtitle: 'குடும்பத்தில் உள்ள சகோதரர் மற்றும் சகோதரி விவரங்களைப் பகிரவும்.',
      fields: [
        { label: 'சகோதரர்கள்', placeholder: 'எ.கா. 1 (திருமணமானவர்)' },
        { label: 'சகோதரிகள்', placeholder: 'எ.கா. 1 (திருமணமாகாதவர்)' },
      ],
    },
    '14': {
      title: 'பிறப்பு வரிசை',
      subtitle: 'சகோதரர்களில் பிறப்பு வரிசையைத் தேர்ந்தெடுக்கவும்.',
      options: [
        { key: 'மூத்தவர்', icon: 'looks_one' },
        { key: 'நடுவில்', icon: 'looks_two' },
        { key: 'இளையவர்', icon: 'looks_3' },
        { key: 'ஒரே பிள்ளை', icon: 'person' },
      ],
    },
    '15': {
      title: 'குடும்ப விவரங்கள்',
      subtitle: 'குடும்ப பின்னணி விவரங்களைப் பகிரவும்.',
      fields: [
        { label: 'குடும்ப வகை', placeholder: 'கூட்டு / தனி குடும்பம்', type: 'select' },
        { label: 'குடும்ப மதிப்புகள்', placeholder: 'பாரம்பரிய / மிதமான / தாராள', type: 'select' },
      ],
    },
    '16': {
      title: 'சொத்து விவரங்கள்',
      subtitle: 'குடும்ப சொத்து விவரங்களைப் பகிரவும்.',
      fields: [{ label: 'சொத்து விவரங்கள்', placeholder: 'எ.கா. சொந்த வீடு, விவசாய நிலம்' }],
    },
    '17': {
      title: 'உயரம்',
      subtitle: 'வரன்/வதுவையின் உயரத்தைத் தேர்ந்தெடுக்கவும்.',
      fields: [{ label: 'உயரம்', placeholder: 'உயரத்தைத் தேர்ந்தெடுக்கவும்', type: 'select' }],
    },
    final: {
      title: 'புகைப்படங்களைப் பதிவேற்று',
      subtitle: 'சுயவிவரத்தை முடிக்க குறைந்தது ஒரு தெளிவான புகைப்படத்தைச் சேர்க்கவும்.',
      options: [
        { key: 'புகைப்படம் சேர்', icon: 'add-a-photo' },
        { key: 'இப்போது தவிர்', icon: 'skip-next' },
      ],
    },
  },
};

const stepIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', 'final'];

function buildStep(id: string, language: Language, index: number, total: number): ProfileStep {
  const content = stepContent[language][id];
  return {
    id,
    step: index + 1,
    total,
    title: content.title,
    subtitle: content.subtitle,
    options: content.options?.map((option) => ({
      label: option.key,
      icon: option.icon,
      wide: option.wide,
    })),
    fields: content.fields,
  };
}

export function getProfileSteps(language: Language): ProfileStep[] {
  const total = stepIds.length;
  return stepIds.map((id, index) => buildStep(id, language, index, total));
}

export function getProfileStep(id: string, language: Language): ProfileStep | undefined {
  return getProfileSteps(language).find((step) => step.id === id);
}

export function getNextStepId(id: string, language: Language): string | null {
  const steps = getProfileSteps(language);
  const index = steps.findIndex((step) => step.id === id);
  if (index === -1 || index === steps.length - 1) return null;
  return steps[index + 1].id;
}

export function getPreviousStepId(id: string, language: Language): string | null {
  const steps = getProfileSteps(language);
  const index = steps.findIndex((step) => step.id === id);
  if (index <= 0) return null;
  return steps[index - 1].id;
}
