import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen, StatBox, Tag, VerifiedBadge } from '@/components/sailinq/ui';
import { SailinqColors, SailinqRadius } from '@/constants/sailinq';
import { useAuth } from '@/lib/auth';
import { getMyProfile, roleLabel, type ProfileView } from '@/lib/profile';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getMyProfile().then((res) => {
        setProfile(res.profile ?? null);
        setLoading(false);
      });
    }, [])
  );

  if (loading) {
    return (
      <Screen edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator color={SailinqColors.mint} size="large" />
        </View>
      </Screen>
    );
  }

  if (!profile) {
    return (
      <Screen edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.muted}>Nie udało się wczytać profilu.</Text>
        </View>
      </Screen>
    );
  }

  const hasPhoto = !!profile.photo;
  const hasAvatar = !!profile.avatar;
  const isEmpty = !profile.bio && profile.tags.length === 0 && !profile.location;

  return (
    <Screen edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Zdjęcie w tle (cover) */}
        <View style={styles.cover}>
          {hasPhoto ? (
            <Image source={{ uri: profile.photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.coverEmpty]} />
          )}
          <LinearGradient colors={['rgba(10,26,44,0)', 'rgba(10,26,44,0.55)']} style={StyleSheet.absoluteFill} />
          <Pressable style={styles.gear} onPress={() => router.push('/edit-profile')}>
            <Ionicons name="create-outline" size={20} color={SailinqColors.text} />
          </Pressable>
        </View>

        {/* Okrągły avatar nachodzący na tło + imię */}
        <View style={styles.headerInfo}>
          <View style={styles.avatarRow}>
            {hasAvatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarEmpty]}>
                <Text style={styles.avatarInitial}>{profile.name[0]?.toUpperCase()}</Text>
              </View>
            )}
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {profile.name}
              {profile.age ? `, ${profile.age}` : ''}
            </Text>
            {profile.verified && <VerifiedBadge />}
          </View>
          <Text style={styles.role}>
            {roleLabel(profile.role)}
            {profile.location ? ` · ${profile.location}` : ''}
          </Text>
        </View>

        <View style={styles.body}>
          {/* Statystyki */}
          <View style={styles.stats}>
            <StatBox value={profile.miles.toLocaleString('pl')} label="MIL MORSKICH" sub={`${profile.milesVerified.toLocaleString('pl')} verified`} />
            <StatBox value={String(profile.tripsCount)} label="REJSÓW" sub="ukończonych" />
            <StatBox value={profile.rating > 0 ? profile.rating.toFixed(1) : '—'} label="OCENA" sub={`${profile.reviewsCount} recenzji`} />
          </View>

          {/* Zachęta do uzupełnienia dla nowego konta */}
          {isEmpty && (
            <Pressable style={styles.completeCard} onPress={() => router.push('/edit-profile')}>
              <Ionicons name="sparkles-outline" size={22} color={SailinqColors.mint} />
              <View style={{ flex: 1 }}>
                <Text style={styles.completeTitle}>Uzupełnij swój profil</Text>
                <Text style={styles.completeSub}>Dodaj zdjęcie, bio i doświadczenie, żeby inni Cię poznali.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={SailinqColors.textMuted} />
            </Pressable>
          )}

          {/* Bio */}
          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

          {/* Tagi */}
          {profile.tags.length > 0 && (
            <>
              <SectionTitle text="Tagi" />
              <View style={styles.tags}>
                {profile.tags.map((t) => (
                  <Tag key={t} label={t} tone="mint" />
                ))}
              </View>
            </>
          )}

          {/* Certyfikaty — placeholder do podłączenia później */}
          <SectionTitle text="Certyfikaty" />
          <View style={styles.certPlaceholder}>
            <Ionicons name="shield-outline" size={20} color={SailinqColors.textMuted} />
            <Text style={styles.certPlaceholderText}>
              Weryfikację certyfikatów (zdjęcie patentu) dodamy wkrótce.
            </Text>
          </View>

          {/* Edytuj profil */}
          <Pressable style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
            <Ionicons name="create-outline" size={18} color={SailinqColors.mintDark} />
            <Text style={styles.editText}>Edytuj profil</Text>
          </Pressable>

          {/* Wyloguj */}
          <Pressable style={styles.logout} onPress={signOut}>
            <Ionicons name="log-out-outline" size={20} color={SailinqColors.nope} />
            <Text style={styles.logoutText}>Wyloguj się</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

function SectionTitle({ text }: { text: string }) {
  return <Text style={styles.sectionTitle}>{text.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: SailinqColors.textMuted },
  cover: { height: 170 },
  coverEmpty: { backgroundColor: SailinqColors.surfaceAlt },
  gear: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(10,26,44,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { paddingHorizontal: 16 },
  avatarRow: { marginTop: -46, marginBottom: 10 },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: SailinqColors.surfaceAlt,
    borderWidth: 4,
    borderColor: SailinqColors.bg,
  },
  avatarEmpty: { alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: SailinqColors.mint, fontSize: 38, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { color: SailinqColors.text, fontSize: 26, fontWeight: '800' },
  role: { color: SailinqColors.textMuted, fontSize: 14, fontWeight: '600', marginTop: 2 },
  body: { paddingHorizontal: 16, marginTop: 18 },
  stats: { flexDirection: 'row', gap: 8 },
  completeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(87,224,198,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(87,224,198,0.25)',
    borderRadius: SailinqRadius.md,
    padding: 14,
    marginTop: 16,
  },
  completeTitle: { color: SailinqColors.text, fontSize: 15, fontWeight: '700' },
  completeSub: { color: SailinqColors.textMuted, fontSize: 13, marginTop: 2, lineHeight: 18 },
  bio: { color: SailinqColors.text, fontSize: 15, lineHeight: 22, marginTop: 16 },
  sectionTitle: {
    color: SailinqColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 22,
    marginBottom: 10,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  certPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: SailinqColors.surface,
    padding: 14,
    borderRadius: SailinqRadius.md,
  },
  certPlaceholderText: { color: SailinqColors.textMuted, fontSize: 13, flex: 1, lineHeight: 18 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    backgroundColor: SailinqColors.mint,
    borderRadius: SailinqRadius.pill,
    height: 52,
  },
  editText: { color: SailinqColors.mintDark, fontSize: 15, fontWeight: '800' },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: SailinqRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  logoutText: { color: SailinqColors.nope, fontSize: 15, fontWeight: '700' },
});
