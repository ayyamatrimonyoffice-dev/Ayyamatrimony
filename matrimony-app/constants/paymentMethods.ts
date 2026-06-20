import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TranslationKey } from '@/constants/i18n';

export type PaymentMethodId = 'gpay' | 'phonepe' | 'upi' | 'paytm';

export type PaymentMethodOption = {
  id: PaymentMethodId;
  labelKey: TranslationKey;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tint: string;
  accent: string;
};

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'gpay',
    labelKey: 'paymentGpay',
    icon: 'google',
    tint: '#E8F5E9',
    accent: '#1B5E20',
  },
  {
    id: 'phonepe',
    labelKey: 'paymentPhonePe',
    icon: 'cellphone',
    tint: '#F3E5F5',
    accent: '#6A1B9A',
  },
  {
    id: 'upi',
    labelKey: 'paymentUpi',
    icon: 'qrcode-scan',
    tint: '#E3F2FD',
    accent: '#1565C0',
  },
  {
    id: 'paytm',
    labelKey: 'paymentPaytm',
    icon: 'wallet',
    tint: '#E0F7FA',
    accent: '#006064',
  },
];
