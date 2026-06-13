import { useState } from 'react';
import { ScrollView } from 'react-native';
import {
  FormDateField,
  FormField,
  FormScreen,
  FormSelectField,
} from '@/components/FormScreen';
import { useLanguage } from '@/context/LanguageContext';

export default function EditProfileScreen() {
  const { translate } = useLanguage();
  const [fullName, setFullName] = useState('Ananya Krishnan');
  const [gender, setGender] = useState('female');
  const [dateOfBirth, setDateOfBirth] = useState('15 / 08 / 1996');
  const [religion, setReligion] = useState('hindu');
  const [community, setCommunity] = useState('iyer');
  const [city, setCity] = useState('Chennai');
  const [occupation, setOccupation] = useState('software');
  const [education, setEducation] = useState('masters');

  return (
    <FormScreen
      titleKey="editProfileTitle"
      successKey="profileUpdated"
      onSave={() => undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        <FormField label={translate('fullName')} value={fullName} onChangeText={setFullName} />
        <FormSelectField
          label={translate('gender')}
          value={gender}
          onValueChange={setGender}
          optionsKey="gender"
          placeholder={translate('selectGender')}
        />
        <FormDateField
          label={translate('dateOfBirth')}
          value={dateOfBirth}
          onValueChange={setDateOfBirth}
        />
        <FormSelectField
          label={translate('religion')}
          value={religion}
          onValueChange={setReligion}
          optionsKey="religion"
          placeholder={translate('selectReligion')}
        />
        <FormSelectField
          label={translate('community')}
          value={community}
          onValueChange={setCommunity}
          optionsKey="community"
        />
        <FormField label={translate('city')} value={city} onChangeText={setCity} />
        <FormSelectField
          label={translate('occupation')}
          value={occupation}
          onValueChange={setOccupation}
          optionsKey="occupation"
        />
        <FormSelectField
          label={translate('education')}
          value={education}
          onValueChange={setEducation}
          optionsKey="education"
        />
      </ScrollView>
    </FormScreen>
  );
}
