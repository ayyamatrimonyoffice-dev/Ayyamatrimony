import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import {
  FormDateField,
  FormField,
  FormFixedCasteField,
  FormScreen,
  FormSelectField,
} from '@/components/FormScreen';
import { FIXED_CASTE_VALUE } from '@/constants/formOptions';
import { useLanguage } from '@/context/LanguageContext';
import { useProfileForm } from '@/context/ProfileFormContext';

export default function EditProfileScreen() {
  const { translate } = useLanguage();
  const { getValue, setValue, isReady } = useProfileForm();
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [religion, setReligion] = useState('');
  const [subCaste, setSubCaste] = useState('');
  const [city, setCity] = useState('');
  const [occupation, setOccupation] = useState('');
  const [workType, setWorkType] = useState('');
  const [education, setEducation] = useState('');

  useEffect(() => {
    if (!isReady) {
      return;
    }

    setFullName(getValue('fullName'));
    setGender(getValue('gender'));
    setDateOfBirth(getValue('dateOfBirth'));
    setReligion(getValue('religion'));
    setSubCaste(getValue('subCaste'));
    setCity(getValue('nativePlace'));
    setOccupation(getValue('occupation'));
    setWorkType(getValue('workType'));
    setEducation(getValue('education'));
  }, [getValue, isReady]);

  const handleSave = () => {
    setValue('fullName', fullName.trim());
    setValue('gender', gender);
    setValue('dateOfBirth', dateOfBirth);
    setValue('religion', religion);
    setValue('caste', FIXED_CASTE_VALUE);
    setValue('subCaste', subCaste);
    setValue('nativePlace', city.trim());
    setValue('occupation', occupation);
    setValue('workType', workType);
    setValue('education', education);
  };

  return (
    <FormScreen titleKey="editProfileTitle" successKey="profileUpdated" onSave={handleSave}>
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
        <FormFixedCasteField label={translate('caste')} />
        <FormSelectField
          label={translate('subCaste')}
          value={subCaste}
          onValueChange={setSubCaste}
          optionsKey="subCaste"
          placeholder={translate('selectSubCaste')}
        />
        <FormField label={translate('city')} value={city} onChangeText={setCity} />
        <FormSelectField
          label={translate('occupation')}
          value={occupation}
          onValueChange={setOccupation}
          optionsKey="occupation"
        />
        <FormSelectField
          label={translate('workType')}
          value={workType}
          onValueChange={setWorkType}
          optionsKey="workType"
          placeholder={translate('selectWorkType')}
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
