import { useCallback, useMemo, useState } from 'react';

import { ActivityIndicator, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useFocusEffect, useRouter } from 'expo-router';

import { MaterialIcons } from '@expo/vector-icons';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';

import { AdminScreenShell } from '@/components/admin/AdminScreenShell';

import { adminColors } from '@/constants/admin';

import { adminFilterLabelKeys } from '@/constants/adminLabels';

import { images } from '@/constants/images';

import { firstDisplayablePhotoUri } from '@/constants/profilePhotos';

import { useLanguage } from '@/context/LanguageContext';

import { listAllProfiles } from '@/lib/firestore/profileService';

import type { FirestoreProfileDoc } from '@/lib/firestore/collections';



type ProfileFilter = 'all' | 'male' | 'female';



const filters: ProfileFilter[] = ['all', 'male', 'female'];



function profilePhoto(profile: FirestoreProfileDoc): string {
  return firstDisplayablePhotoUri(
    [
      profile.primaryPhotoUrl ?? '',
      profile.listing?.image ?? '',
      ...(profile.photoUrls ?? []),
      ...(profile.approvedPhotoUrls ?? []),
    ],
    Platform.OS === 'web' ? 'web' : 'native',
  );
}



export default function AdminMatchesScreen() {

  const router = useRouter();

  const { translate } = useLanguage();

  const [profiles, setProfiles] = useState<FirestoreProfileDoc[]>([]);

  const [filter, setFilter] = useState<ProfileFilter>('all');

  const [isLoading, setIsLoading] = useState(true);



  const refresh = useCallback(async () => {

    setIsLoading(true);

    try {

      const entries = await listAllProfiles();

      setProfiles(

        entries.filter(

          (profile) =>

            profile.published &&

            profile.accountStatus !== 'blocked' &&

            profile.accountStatus !== 'deleted' &&

            profile.approvalStatus !== 'rejected',

        ),

      );

    } finally {

      setIsLoading(false);

    }

  }, []);



  useFocusEffect(

    useCallback(() => {

      void refresh();

    }, [refresh]),

  );



  const filteredProfiles = useMemo(() => {

    if (filter === 'all') {

      return profiles;

    }

    return profiles.filter((profile) => profile.gender === filter);

  }, [filter, profiles]);



  const openProfile = (phone: string) => {

    router.push(`/admin/view-profile/${phone}` as never);

  };



  return (

    <AdminScreenShell

      title={translate('adminMatches')}

      showLanguageToggle

    >



      <View style={styles.filters}>

        {filters.map((item) => {

          const active = filter === item;

          return (

            <Pressable

              key={item}

              style={[styles.chip, active && styles.chipActive]}

              onPress={() => setFilter(item)}

            >

              <Text style={[styles.chipText, active && styles.chipTextActive]}>

                {translate(adminFilterLabelKeys[item])}

              </Text>

            </Pressable>

          );

        })}

      </View>



      {isLoading ? (

        <View style={styles.loading}>

          <ActivityIndicator size="large" color={adminColors.primary} />

        </View>

      ) : filteredProfiles.length === 0 ? (

        <AdminEmptyState

          icon="favorite"

          title={translate('adminNoProfilesToShow')}

          message={translate('adminNoProfilesMessage')}

        />

      ) : (

        <View style={styles.grid}>

          {filteredProfiles.map((profile) => {

            const photo = profilePhoto(profile);

            return (

              <Pressable

                key={profile.phone}

                style={styles.card}

                onPress={() => openProfile(profile.phone)}

              >

                <View style={styles.cardImageWrap}>

                  {photo ? (

                    <Image source={{ uri: photo }} style={styles.cardImage} resizeMode="cover" />

                  ) : (

                    <Image source={images.logo} style={styles.cardPlaceholder} resizeMode="contain" />

                  )}

                </View>

                <View style={styles.cardBody}>

                  <Text style={styles.cardName} numberOfLines={1}>

                    {profile.fullName || profile.listing?.name || translate('adminMember')}

                  </Text>

                  <View style={styles.phoneRow}>

                    <MaterialIcons name="phone" size={13} color={adminColors.primary} />

                    <Text style={styles.cardPhone} numberOfLines={1}>

                      {profile.phone}

                    </Text>

                  </View>

                  <Text style={styles.cardMeta} numberOfLines={1}>

                    {profile.registrationCommunity || profile.listing?.community || '—'}

                    {profile.listing?.age ? ` · ${profile.listing.age}` : ''}

                  </Text>

                </View>

                <MaterialIcons name="chevron-right" size={20} color={adminColors.textMuted} />

              </Pressable>

            );

          })}

        </View>

      )}

    </AdminScreenShell>

  );

}



const styles = StyleSheet.create({

  filters: {

    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 8,

  },

  chip: {

    paddingHorizontal: 12,

    paddingVertical: 7,

    borderRadius: 999,

    backgroundColor: adminColors.surface,

    borderWidth: 1,

    borderColor: adminColors.border,

  },

  chipActive: {

    backgroundColor: adminColors.primary,

    borderColor: adminColors.primary,

  },

  chipText: {

    color: adminColors.textMuted,

    fontSize: 12,

    fontWeight: '600',

  },

  chipTextActive: {

    color: '#fff',

  },

  loading: {

    paddingVertical: 48,

    alignItems: 'center',

  },

  grid: {

    gap: 10,

    paddingBottom: 16,

  },

  card: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 12,

    backgroundColor: adminColors.surface,

    borderRadius: 12,

    borderWidth: 1,

    borderColor: adminColors.border,

    padding: 10,

  },

  cardImageWrap: {

    width: 64,

    height: 78,

    borderRadius: 10,

    overflow: 'hidden',

    backgroundColor: adminColors.primaryLight,

  },

  cardImage: {

    width: '100%',

    height: '100%',

  },

  cardPlaceholder: {

    width: '100%',

    height: '100%',

    opacity: 0.35,

  },

  cardBody: {

    flex: 1,

    gap: 3,

    minWidth: 0,

  },

  cardName: {

    fontSize: 15,

    fontWeight: '700',

    color: adminColors.text,

  },

  phoneRow: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 4,

  },

  cardPhone: {

    fontSize: 13,

    fontWeight: '600',

    color: adminColors.text,

  },

  cardMeta: {

    fontSize: 12,

    color: adminColors.textMuted,

  },

});


