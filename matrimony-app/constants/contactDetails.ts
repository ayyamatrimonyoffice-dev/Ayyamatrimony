import { Language } from '@/constants/i18n';
import { ProfileFieldConfig } from '@/constants/formOptions';

export const CONTACT_STEP_ID = '19';

export const PHONE_DIGIT_LENGTH = 10;

export const CONTACT_PHONE_KEY = 'contactPhone';
export const WHATSAPP_NUMBER_KEY = 'whatsappNumber';
export const FACEBOOK_PROFILE_KEY = 'facebookProfile';
export const INSTAGRAM_PROFILE_KEY = 'instagramProfile';

export type InterestStatus = 'none' | 'sent' | 'received' | 'mutual';

type ContactFieldDefinition = {
  config: ProfileFieldConfig;
  display: Record<Language, { label: string; placeholder: string }>;
};

const contactDetailsFields: ContactFieldDefinition[] = [
  {
    config: {
      fieldKey: CONTACT_PHONE_KEY,
      kind: 'text',
      optional: true,
      keyboardType: 'phone-pad',
      maxLength: PHONE_DIGIT_LENGTH,
    },
    display: {
      en: { label: 'Phone Number', placeholder: 'Enter mobile' },
      ta: { label: 'தொலைபேசி எண்', placeholder: 'மொபைலை உள்ளிடவும்' },
    },
  },
  {
    config: {
      fieldKey: WHATSAPP_NUMBER_KEY,
      kind: 'text',
      optional: true,
      keyboardType: 'phone-pad',
      maxLength: PHONE_DIGIT_LENGTH,
    },
    display: {
      en: { label: 'WhatsApp Number', placeholder: 'Enter WhatsApp mobile' },
      ta: { label: 'வாட்ஸ்அப் எண்', placeholder: 'வாட்ஸ்அப் மொபைலை உள்ளிடவும்' },
    },
  },
  {
    config: { fieldKey: FACEBOOK_PROFILE_KEY, kind: 'text', optional: true },
    display: {
      en: { label: 'Facebook Profile', placeholder: 'Profile URL or username' },
      ta: { label: 'Facebook சுயவிவரம்', placeholder: 'URL அல்லது பயனர்பெயர்' },
    },
  },
  {
    config: { fieldKey: INSTAGRAM_PROFILE_KEY, kind: 'text', optional: true },
    display: {
      en: { label: 'Instagram Profile', placeholder: '@username or profile URL' },
      ta: { label: 'Instagram சுயவிவரம்', placeholder: '@username அல்லது URL' },
    },
  },
];

export function getContactDetailsStepFields(language: Language) {
  return {
    configs: contactDetailsFields.map((field) => field.config),
    fields: contactDetailsFields.map((field) => field.display[language]),
  };
}

export function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, PHONE_DIGIT_LENGTH);
}

export function isValidPhoneNumber(value: string): boolean {
  return normalizePhoneDigits(value).length === PHONE_DIGIT_LENGTH;
}

export function maskPhoneNumber(value: string): string {
  const digits = normalizePhoneDigits(value);
  if (digits.length < 4) {
    return '*'.repeat(Math.max(digits.length, 4));
  }
  return `${'*'.repeat(digits.length - 4)}${digits.slice(-4)}`;
}

export function canRevealPhoneNumber(status: InterestStatus): boolean {
  return status === 'mutual';
}

export type MemberContactDetails = {
  phoneNumber: string;
  whatsappNumber?: string;
  facebookProfile?: string;
  instagramProfile?: string;
  interestStatus: InterestStatus;
};
