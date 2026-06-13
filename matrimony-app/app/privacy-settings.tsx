import { useState } from 'react';
import { ScrollView } from 'react-native';
import { FormScreen, ToggleRow } from '@/components/FormScreen';
import { useLanguage } from '@/context/LanguageContext';

export default function PrivacySettingsScreen() {
  const { translate } = useLanguage();
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [showPhotos, setShowPhotos] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [privateBrowsing, setPrivateBrowsing] = useState(false);

  return (
    <FormScreen
      titleKey="privacySettingsTitle"
      successKey="privacySaved"
      onSave={() => undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
        <ToggleRow
          label={translate('profileVisibility')}
          value={profileVisibility}
          onValueChange={setProfileVisibility}
        />
        <ToggleRow
          label={translate('showPhoneNumber')}
          value={showPhoneNumber}
          onValueChange={setShowPhoneNumber}
        />
        <ToggleRow
          label={translate('showPhotos')}
          value={showPhotos}
          onValueChange={setShowPhotos}
        />
        <ToggleRow
          label={translate('allowMessages')}
          value={allowMessages}
          onValueChange={setAllowMessages}
        />
        <ToggleRow
          label={translate('privateBrowsing')}
          value={privateBrowsing}
          onValueChange={setPrivateBrowsing}
        />
      </ScrollView>
    </FormScreen>
  );
}
