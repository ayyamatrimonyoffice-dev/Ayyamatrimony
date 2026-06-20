import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { PAYMENT_METHODS, type PaymentMethodId } from '@/constants/paymentMethods';
import { useLanguage } from '@/context/LanguageContext';
import { useSubscription } from '@/context/SubscriptionContext';

export function usePaymentCheckout(onSuccess: () => void) {
  const { translate, translateFormat } = useLanguage();
  const { processPayment, accessPrice, batchSize } = useSubscription();
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const openPaymentMethods = useCallback(() => {
    setPaymentModalVisible(true);
  }, []);

  const closePaymentMethods = useCallback(() => {
    setPaymentModalVisible(false);
  }, []);

  const handlePaymentMethodSelect = useCallback(
    (method: PaymentMethodId) => {
      setPaymentModalVisible(false);

      void (async () => {
        await processPayment();
        onSuccess();

        const methodOption = PAYMENT_METHODS.find((item) => item.id === method);
        const methodLabel = methodOption ? translate(methodOption.labelKey) : method;

        Alert.alert(
          translate('paymentSuccessTitle'),
          translateFormat('paymentSuccessBody', {
            method: methodLabel,
            count: batchSize,
          }),
        );
      })();
    },
    [batchSize, onSuccess, processPayment, translate, translateFormat],
  );

  return {
    paymentModalVisible,
    openPaymentMethods,
    closePaymentMethods,
    handlePaymentMethodSelect,
    accessPrice,
  };
}
